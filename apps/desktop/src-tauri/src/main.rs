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
      config::State::new(app)?;

      model::downloader::State::new(app)?;
      model::config::State::new(app)?;
      model::integrity::State::new(app)?;
      model::stats::State::new(app)?;
      thread::config::State::new(app)?;
      inference::server_config::State::new(app)?;

      // A hack to make MacOS window show up in dev mode...
      #[cfg(all(debug_assertions, not(target_os = "windows")))]
      {
        use tauri::Manager;
        let window = app.get_window("main").unwrap();
        window.show().unwrap();
      }

      Ok(())
    })
    // NOTE: When adding new commands, make sure to run the generate_ts_enums test to update the TS enum
    .invoke_handler(tauri::generate_handler![
      config::get_config,
      config::set_config,
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
      model::pool::load_model,
      inference::server::start_server,
      inference::server::stop_server,
      inference::server_config::get_server_config,
      inference::server_config::set_server_config,
      inference::gpu::check_gpu,
      utils::fs::open_directory,
      test::test_model,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[test]
/**
 * Generate the enum for the client side invocation
 * Based on https://matklad.github.io/2022/03/26/self-modifying-code.html#Minimalist-Solution
 */
fn generate_ts_cmd_enums() {
  use convert_case::{Case, Casing};

  fn split_twice<'a>(
    text: &'a str,
    start_marker: &str,
    end_marker: &str,
  ) -> Option<(&'a str, &'a str, &'a str)> {
    let (prefix, rest) = text.split_once(start_marker)?;
    let (mid, suffix) = rest.split_once(end_marker)?;
    Some((prefix, mid, suffix))
  }

  let main_rs_text = std::fs::read_to_string(file!()).unwrap();

  let (_, tauri_cmds, _) = split_twice(
    &main_rs_text,
    ".invoke_handler(tauri::generate_handler![\n",
    "])",
  )
  .unwrap();

  let arms = tauri_cmds
    .lines()
    .map(|line| {
      line
        .trim()
        .trim_end_matches(',')
        .split("::")
        .last()
        .unwrap()
    })
    .enumerate()
    // filter only non-empty string
    .filter(|(_, cmd)| !cmd.is_empty())
    .map(|(_, cmd)| format!("  {} = \"{cmd}\"", cmd.to_case(Case::Pascal)))
    .collect::<Vec<_>>()
    .join(",\n");

  let ts_enum_path = std::path::Path::new("../src/features/invoke/_shared.ts");

  let ts_original_text = std::fs::read_to_string(ts_enum_path).unwrap();

  let new_text = {
    let start_marker = "  //#region GENERATED\n";
    let end_marker = "\n  //#endregion\n";

    let (prefix, _, suffix) =
      split_twice(&ts_original_text, start_marker, end_marker).unwrap();
    format!("{prefix}{start_marker}{arms}{end_marker}{suffix}")
  };

  std::fs::write(ts_enum_path, new_text).unwrap();
}
