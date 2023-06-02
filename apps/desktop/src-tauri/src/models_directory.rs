use std::{path::PathBuf, time::SystemTime};

use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use walkdir::WalkDir;

use crate::{
    config::{get_models_path, set_models_path},
    downloader,
    kv_bucket::remove_data,
    model_integrity, model_stats, model_type,
    path::get_app_dir_path_buf,
};

#[derive(Serialize, Deserialize)]
pub struct FileInfo {
    size: u64,
    path: String,
    name: String,
    modified: SystemTime,
}

#[derive(Serialize, Deserialize)]
pub struct ModelDirectoryState {
    path: String,
    files: Vec<FileInfo>,
}

#[tauri::command]
pub async fn read_directory(dir: &str) -> Result<Vec<FileInfo>, String> {
    let walker = WalkDir::new(dir).into_iter();

    let file_infos: Vec<FileInfo> = walker
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file())
        .par_bridge()
        .map(|entry| {
            let path = entry.path().display().to_string();
            let name = entry
                .path()
                .file_stem()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string();
            let metadata = entry.metadata().unwrap();
            let size = metadata.len();
            let modified = metadata.modified().unwrap();

            FileInfo {
                path,
                size,
                name,
                modified,
            }
        })
        .collect();

    Ok(file_infos)
}

pub async fn get_default_models_path_buf(app_handle: AppHandle) -> Result<PathBuf, String> {
    get_app_dir_path_buf(app_handle, String::from("models")).await
}

// Move this to a state
pub async fn get_current_models_path(app_handle: AppHandle) -> Result<String, String> {
    let default_models_path_buf = get_default_models_path_buf(app_handle.clone()).await?;

    Ok(get_models_path(app_handle).unwrap_or(default_models_path_buf.display().to_string()))
}

fn sort_files(
    files: &mut Vec<FileInfo>,
    model_stats_bucket_state: tauri::State<'_, model_stats::State>,
) {
    let get_load_count = |file: &FileInfo| {
        model_stats::get_model_stats(model_stats_bucket_state.clone(), file.path.as_str())
            .unwrap_or(model_stats::ModelStats::default())
            .load_count
    };

    files.sort_unstable_by(|a, b| {
        let a_load_count = get_load_count(a);
        let b_load_count = get_load_count(b);

        if a_load_count == b_load_count {
            b.modified.cmp(&a.modified)
        } else {
            b_load_count.cmp(&a_load_count)
        }
    });
}

#[tauri::command]
pub async fn initialize_models_dir(
    app_handle: AppHandle,
    model_stats_bucket_state: tauri::State<'_, model_stats::State>,
) -> Result<ModelDirectoryState, String> {
    let models_path = get_current_models_path(app_handle).await?;

    let mut files = read_directory(models_path.as_str()).await?;

    sort_files(&mut files, model_stats_bucket_state.clone());

    Ok(ModelDirectoryState {
        path: models_path,
        files,
    })
}

#[tauri::command]
pub async fn update_models_dir(
    app_handle: AppHandle,
    dir: &str,
    model_stats_bucket_state: tauri::State<'_, model_stats::State>,
) -> Result<ModelDirectoryState, String> {
    set_models_path(app_handle, dir.to_string())
        .map_err(|e| format!("Error setting models path: {}", e))?;

    let mut files = read_directory(dir).await?;

    sort_files(&mut files, model_stats_bucket_state.clone());

    Ok(ModelDirectoryState {
        path: String::from(dir),
        files,
    })
}

#[tauri::command]
pub async fn delete_model_file(
    model_integrity_bucket_state: tauri::State<'_, model_integrity::State>,
    model_type_bucket_state: tauri::State<'_, model_type::State>,
    model_stats_bucket_state: tauri::State<'_, model_stats::State>,
    model_download_progress_state: tauri::State<'_, downloader::State>,

    path: &str,
) -> Result<(), String> {
    tokio::try_join!(
        async {
            tokio::fs::remove_file(&path)
                .await
                .map_err(|e| format!("{}", e))
        },
        remove_data(&model_integrity_bucket_state.0, &path),
        remove_data(&model_type_bucket_state.0, &path),
        remove_data(&model_stats_bucket_state.0, &path),
        remove_data(
            &model_download_progress_state.download_progress_bucket,
            &path
        )
    )?;

    Ok(())
}
