use std::path::PathBuf;

use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use walkdir::WalkDir;

use crate::{
    config::{get_models_path, set_models_path},
    path::get_app_dir_path_buf,
};

#[derive(Serialize, Deserialize)]
pub struct FileInfo {
    size: u64,
    path: String,
    name: String,
}

#[derive(Serialize, Deserialize)]
pub struct ModelDirectoryState {
    path: String,
    files: Vec<FileInfo>,
}

#[tauri::command]
pub async fn read_directory(dir: &str) -> Result<Vec<FileInfo>, String> {
    let walker = WalkDir::new(dir).into_iter();

    let mut file_infos: Vec<FileInfo> = walker
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
            let size = entry.metadata().unwrap().len();
            FileInfo { path, size, name }
        })
        .collect();

    file_infos.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(file_infos)
}

pub async fn get_default_models_path_buf(app_handle: &AppHandle) -> Result<PathBuf, String> {
    get_app_dir_path_buf(&app_handle, String::from("models"))
        .await
        .map_err(|e| format!("{}", e))
}

pub async fn get_current_models_path(app_handle: &AppHandle) -> Result<String, String> {
    let default_models_path_buf = get_default_models_path_buf(&app_handle).await?;

    Ok(get_models_path(&app_handle).unwrap_or(default_models_path_buf.display().to_string()))
}

#[tauri::command]
pub async fn initialize_models_dir(app_handle: AppHandle) -> Result<ModelDirectoryState, String> {
    let models_path = get_current_models_path(&app_handle).await?;

    let files = read_directory(models_path.as_str()).await?;

    Ok(ModelDirectoryState {
        path: models_path,
        files,
    })
}

#[tauri::command]
pub async fn update_models_dir(
    app_handle: AppHandle,
    dir: &str,
) -> Result<ModelDirectoryState, String> {
    set_models_path(&app_handle, dir.to_string())
        .map_err(|e| format!("Error setting models path: {}", e))?;

    let files = read_directory(dir).await?;

    Ok(ModelDirectoryState {
        path: String::from(dir),
        files,
    })
}

#[tauri::command]
pub async fn delete_model_file(app_handle: AppHandle, file_path: &str) -> Result<(), String> {
    let models_path = get_current_models_path(&app_handle).await?;

    Ok(())
}
