use std::time::Duration;

use crate::{
  config::{self, ConfigKey},
  downloader,
  kv_bucket::remove_data,
  model_integrity, model_stats, model_type,
  path::{read_directory, DirectoryState, FileInfo},
};

// Move this to a state
pub fn get_current_models_path(
  default_path_state: tauri::State<'_, crate::path::State>,
  config_bucket_state: tauri::State<'_, crate::config::State>,
) -> Result<String, String> {
  Ok(
    config_bucket_state
      .get(ConfigKey::ModelsDirectory)
      .unwrap_or(
        default_path_state
          .models_directory_buf
          .display()
          .to_string(),
      ),
  )
}

fn sort_files(
  files: &mut Vec<FileInfo>,
  model_stats_bucket_state: tauri::State<'_, model_stats::State>,
) {
  let get_load_count = |file: &FileInfo| {
    model_stats::get_model_stats(
      model_stats_bucket_state.clone(),
      file.path.as_str(),
    )
    .unwrap_or(model_stats::ModelStats::default())
    .load_count
  };

  files.retain(|f| f.path.ends_with(".bin"));

  files.sort_unstable_by(|a, b| {
    let a_load_count = get_load_count(a);
    let b_load_count = get_load_count(b);

    let a_modified_adjusted =
      a.modified.unwrap_or(std::time::SystemTime::UNIX_EPOCH)
        + Duration::from_secs(a_load_count as u64 * 3600);

    let b_modified_adjusted =
      b.modified.unwrap_or(std::time::SystemTime::UNIX_EPOCH)
        + Duration::from_secs(b_load_count as u64 * 3600);

    // Adjust the modification date by adding 1 hour for each load count

    // Compare the adjusted modification dates
    b_modified_adjusted.cmp(&a_modified_adjusted)
  });
}

#[tauri::command]
pub async fn initialize_models_dir(
  default_path_state: tauri::State<'_, crate::path::State>,
  config_bucket_state: tauri::State<'_, config::State>,
  model_stats_bucket_state: tauri::State<'_, model_stats::State>,
) -> Result<DirectoryState, String> {
  let models_path =
    get_current_models_path(default_path_state, config_bucket_state)?;

  let mut files = read_directory(models_path.as_str()).await?;

  sort_files(&mut files, model_stats_bucket_state.clone());

  Ok(DirectoryState {
    path: models_path,
    files,
  })
}

#[tauri::command]
pub async fn update_models_dir(
  dir: &str,
  config_bucket: tauri::State<'_, config::State>,
  model_stats_bucket_state: tauri::State<'_, model_stats::State>,
) -> Result<DirectoryState, String> {
  config_bucket.set(ConfigKey::ModelsDirectory, dir.to_string())?;

  let mut files = read_directory(dir).await?;

  sort_files(&mut files, model_stats_bucket_state.clone());

  Ok(DirectoryState {
    path: String::from(dir),
    files,
  })
}

#[tauri::command]
pub async fn delete_model_file(
  model_integrity_bucket_state: tauri::State<'_, model_integrity::State>,
  model_type_bucket_state: tauri::State<'_, model_type::State>,
  model_stats_bucket_state: tauri::State<'_, model_stats::State>,
  model_download_progress_state: tauri::State<'_, downloader::State>,

  path: &str,
) -> Result<(), String> {
  tokio::try_join!(
    async {
      tokio::fs::remove_file(&path)
        .await
        .map_err(|e| format!("{}", e))
    },
    remove_data(&model_integrity_bucket_state.0, &path),
    remove_data(&model_type_bucket_state.0, &path),
    remove_data(&model_stats_bucket_state.0, &path),
    remove_data(
      &model_download_progress_state.download_progress_bucket,
      &path
    )
  )?;

  Ok(())
}
