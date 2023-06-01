#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

mod abort_stream;
mod config;
mod db;
mod downloader;
mod inference_server;
mod inference_thread;
mod kv_bucket;
mod model_integrity;
mod model_pool;
mod model_type;
mod models_directory;
mod path;
mod test;
mod utils;

fn main() {
    tauri::Builder::default()
        .manage(inference_server::State::default())
        .plugin(tauri_plugin_persisted_scope::init())
        .setup(|app| {
            downloader::State::new(app)?;
            model_type::State::new(app)?;
            model_integrity::State::new(app)?;

            // A hack to make MacOS window show up in dev mode...
            #[cfg(all(debug_assertions, target_os = "macos"))]
            {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            downloader::get_download_progress,
            downloader::start_download,
            downloader::pause_download,
            downloader::resume_download,
            model_integrity::get_cached_integrity,
            model_integrity::compute_integrity,
            models_directory::read_directory,
            models_directory::update_models_dir,
            models_directory::initialize_models_dir,
            models_directory::delete_model_file,
            inference_server::start_server,
            inference_server::stop_server,
            inference_server::load_model,
            model_type::get_model_type,
            model_type::set_model_type,
            test::test_model,
            utils::fs::open_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
