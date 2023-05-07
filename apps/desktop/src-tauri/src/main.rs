#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use downloader::download_model;
mod downloader;
mod kv_bucket;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_persisted_scope::init())
        .invoke_handler(tauri::generate_handler![download_model])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
