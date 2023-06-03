use std::{path::PathBuf, time::SystemTime};

use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use walkdir::WalkDir;

/// Default paths
#[derive(Clone)]
pub struct State {
    pub models_directory_buf: PathBuf,
    pub threads_directory_buf: PathBuf,
}

impl State {
    pub fn new(app: &mut tauri::App) -> Result<(), String> {
        app.manage(State {
            models_directory_buf: get_app_dir_path_buf(app.handle(), String::from("models"))?,
            threads_directory_buf: get_app_dir_path_buf(app.handle(), String::from("threads"))?,
        });
        Ok(())
    }
}

pub fn get_app_dir_path_buf(app_handle: AppHandle, namespace: String) -> Result<PathBuf, String> {
    let ns_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| String::from("Could not get app data dir."))?
        .join(namespace);

    if !ns_dir.exists() {
        std::fs::create_dir_all(&ns_dir).map_err(|e| format!("{}", e))?;
    }

    Ok(ns_dir)
}

#[derive(Serialize, Deserialize)]
pub struct FileInfo {
    pub size: u64,
    pub path: String,
    pub name: String,
    pub modified: SystemTime,
}

#[derive(Serialize, Deserialize)]
pub struct DirectoryState {
    pub path: String,
    pub files: Vec<FileInfo>,
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

#[tauri::command]
pub async fn write_file(path: &str, content: &str) -> Result<(), String> {
    tokio::fs::write(path, content)
        .await
        .map_err(|e| format!("{}", e))
}

#[tauri::command]
pub async fn read_file(path: &str) -> Result<String, String> {
    let bytes = tokio::fs::read(path).await.map_err(|e| format!("{}", e))?;

    let content = String::from_utf8(bytes).map_err(|e| format!("{}", e))?;
    Ok(content)
}
