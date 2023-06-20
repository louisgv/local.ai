#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod config;
mod db;
mod inference;
mod macros;
mod model;
mod path;
mod test;
mod thread;
mod utils;

fn main() {
  tauri::Builder::default()
    .manage(inference::server::State::default())
    .plugin(tauri_plugin_persisted_scope::init())
    .setup(|app| {
      path::State::new(app)?;
      config::State::new(app)?;

      model::downloader::State::new(app)?;
      model::config::State::new(app)?;
      model::r#type::State::new(app)?;
      model::integrity::State::new(app)?;
      model::stats::State::new(app)?;
      thread::config::State::new(app)?;

      // A hack to make MacOS window show up in dev mode...
      #[cfg(all(debug_assertions, not(target_os = "windows")))]
      {
        use tauri::Manager;
        let window = app.get_window("main").unwrap();
        window.show().unwrap();
      }

      Ok(())
    })
    // NOTE: New cmd should be added to src/invoke/_shared.ts
    // TODO: a middleware to convert this into the ts enum would be nice
    .invoke_handler(tauri::generate_handler![
      config::get_config,
      path::read_directory,
      path::write_file,
      path::read_file,
      thread::config::get_thread_config,
      thread::config::set_thread_config,
      thread::directory::append_thread_content,
      thread::directory::read_thread_file,
      thread::directory::initialize_threads_dir,
      thread::directory::update_threads_dir,
      thread::directory::delete_thread_file,
      thread::directory::create_thread_file,
      thread::directory::rename_thread_file,
      model::directory::update_models_dir,
      model::directory::initialize_models_dir,
      model::directory::delete_model_file,
      model::downloader::get_download_progress,
      model::downloader::start_download,
      model::downloader::pause_download,
      model::downloader::resume_download,
      model::integrity::get_cached_integrity,
      model::integrity::compute_model_integrity,
      model::stats::get_model_stats,
      model::config::get_model_config,
      model::config::set_model_config,
      inference::server::start_server,
      inference::server::stop_server,
      model::pool::load_model,
      model::r#type::get_model_type,
      model::r#type::set_model_type,
      test::test_model,
      utils::fs::open_directory,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
