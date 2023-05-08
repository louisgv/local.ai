#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod checksum;
mod config;
mod downloader;
mod kv_bucket;
mod models_directory;
mod path;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_persisted_scope::init())
        .invoke_handler(tauri::generate_handler![
            downloader::download_model,
            checksum::get_hash,
            models_directory::read_directory,
            models_directory::get_initial_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
