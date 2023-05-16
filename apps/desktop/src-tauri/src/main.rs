#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use inference_server::InferenceServerState;

mod abort_stream;
mod config;
mod downloader;
mod inference_server;
mod inference_thread;
mod kv_bucket;
mod model_integrity;
mod model_type;
mod models_directory;
mod path;
mod test;
fn main() {
    tauri::Builder::default()
        .manage(InferenceServerState::default())
        .plugin(tauri_plugin_persisted_scope::init())
        .invoke_handler(tauri::generate_handler![
            downloader::download_model,
            model_integrity::get_cached_integrity,
            model_integrity::get_integrity,
            models_directory::read_directory,
            models_directory::update_models_dir,
            models_directory::initialize_models_dir,
            inference_server::start_server,
            inference_server::stop_server,
            inference_server::load_model,
            model_type::get_cached_model_type,
            model_type::set_model_type,
            test::test_model,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
