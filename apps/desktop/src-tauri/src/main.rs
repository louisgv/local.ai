#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod abort_stream;
mod config;
mod db;
mod downloader;
mod inference;
mod kv_bucket;
mod macros;
mod model_config;
mod model_integrity;
mod model_pool;
mod model_stats;
mod model_type;
mod models_directory;
mod path;
mod test;
mod threads_directory;
mod utils;
fn main() {
  tauri::Builder::default()
    .manage(inference::server::State::default())
    .plugin(tauri_plugin_persisted_scope::init())
    .setup(|app| {
      path::State::new(app)?;
      config::State::new(app)?;
      downloader::State::new(app)?;
      model_config::State::new(app)?;
      model_type::State::new(app)?;
      model_integrity::State::new(app)?;
      model_stats::State::new(app)?;

      // A hack to make MacOS window show up in dev mode...
      #[cfg(all(debug_assertions, target_os = "macos"))]
      {
        use tauri::Manager;
        let window = app.get_window("main").unwrap();
        window.show().unwrap();
      }

      Ok(())
    })
    // NOTE: New cmd should be added to invoke/_shared.ts
    .invoke_handler(tauri::generate_handler![
      config::get_config,
      path::read_directory,
      path::write_file,
      path::read_file,
      threads_directory::append_thread_content,
      threads_directory::read_thread_file,
      threads_directory::initialize_threads_dir,
      threads_directory::update_threads_dir,
      threads_directory::delete_thread_file,
      threads_directory::create_thread_file,
      threads_directory::rename_thread_file,
      models_directory::update_models_dir,
      models_directory::initialize_models_dir,
      models_directory::delete_model_file,
      downloader::get_download_progress,
      downloader::start_download,
      downloader::pause_download,
      downloader::resume_download,
      model_integrity::get_cached_integrity,
      model_integrity::compute_model_integrity,
      model_stats::get_model_stats,
      model_config::get_model_config,
      model_config::set_model_config,
      inference::server::start_server,
      inference::server::stop_server,
      model_pool::load_model,
      model_type::get_model_type,
      model_type::set_model_type,
      test::test_model,
      utils::fs::open_directory,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
