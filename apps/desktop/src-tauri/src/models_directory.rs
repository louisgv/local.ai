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

pub async fn get_default_models_path_buf(app_handle: &AppHandle) -> PathBuf {
    get_app_dir_path_buf(&app_handle, String::from("models"))
        .await
        .unwrap()
}

#[tauri::command]
pub async fn initialize_models_dir(app_handle: AppHandle) -> Result<ModelDirectoryState, String> {
    let default_directory = get_default_models_path_buf(&app_handle)
        .await
        .display()
        .to_string();

    let model_path = get_models_path(&app_handle).unwrap_or(default_directory);

    println!("model_path: {}", model_path);

    let files = read_directory(model_path.as_str()).await?;

    Ok(ModelDirectoryState {
        path: model_path,
        files,
    })
}

#[tauri::command]
pub async fn update_models_dir(
    app_handle: AppHandle,
    dir: &str,
) -> Result<ModelDirectoryState, String> {
    match set_models_path(&app_handle, dir.to_string()) {
        Ok(_) => (),
        Err(e) => return Err(format!("Error setting models path: {}", e)),
    };

    let files = read_directory(dir).await?;

    Ok(ModelDirectoryState {
        path: String::from(dir),
        files,
    })
}
