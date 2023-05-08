use std::path::PathBuf;

use tokio::fs::create_dir_all;

pub async fn get_app_dir_path_buf(
    app_handle: &tauri::AppHandle,
    namespace: String,
) -> Result<PathBuf, std::io::Error> {
    let ns_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .unwrap()
        .join(namespace);

    if !ns_dir.exists() {
        create_dir_all(&ns_dir).await?;
    }

    Ok(ns_dir)
}

pub async fn get_app_dir_path(app_handle: &tauri::AppHandle, namespace: String) -> String {
    get_app_dir_path_buf(app_handle, namespace)
        .await
        .unwrap()
        .display()
        .to_string()
}

pub async fn get_app_file_path(
    app_handle: &tauri::AppHandle,
    namespace: String,
    name: String,
) -> String {
    get_app_dir_path_buf(app_handle, namespace)
        .await
        .unwrap()
        .join(name)
        .display()
        .to_string()
}
