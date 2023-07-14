use std::time::Duration;

use crate::{
  config::{self, ConfigKey},
  model,
  path::{read_directory, DirectoryState, FileInfo},
  utils::kv_bucket::remove_data,
};

static LOAD_MODIFIER: u64 = 3600 * 24;

fn sort_files(
  files: &mut Vec<FileInfo>,
  model_stats_bucket_state: tauri::State<'_, model::stats::State>,
) {
  let get_load_count = |file: &FileInfo| {
    model_stats_bucket_state
      .get(&file.path.as_str())
      .unwrap_or(model::stats::ModelStats::default())
      .load_count
  };

  files.retain(|f| f.path.ends_with(".bin"));

  files.sort_unstable_by(|a, b| {
    let a_load_count = get_load_count(a);
    let b_load_count = get_load_count(b);

    // Adjust the modification date by load count
    let a_modified_adjusted =
      a.modified.unwrap_or(std::time::SystemTime::UNIX_EPOCH)
        + Duration::from_secs(a_load_count as u64 * LOAD_MODIFIER);

    let b_modified_adjusted =
      b.modified.unwrap_or(std::time::SystemTime::UNIX_EPOCH)
        + Duration::from_secs(b_load_count as u64 * LOAD_MODIFIER);

    // Compare the adjusted modification dates
    b_modified_adjusted.cmp(&a_modified_adjusted)
  });
}

#[tauri::command]
pub async fn initialize_models_dir(
  config_bucket_state: tauri::State<'_, config::State>,
  model_stats_bucket_state: tauri::State<'_, model::stats::State>,
) -> Result<DirectoryState, String> {
  let models_path = config_bucket_state.read(ConfigKey::ModelsDirectory)?;

  println!("{models_path}");

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
  model_stats_bucket_state: tauri::State<'_, model::stats::State>,
) -> Result<DirectoryState, String> {
  config_bucket.write(ConfigKey::ModelsDirectory, dir)?;

  let mut files = read_directory(dir).await?;

  sort_files(&mut files, model_stats_bucket_state.clone());

  Ok(DirectoryState {
    path: String::from(dir),
    files,
  })
}

#[tauri::command]
pub async fn delete_model_file(
  model_integrity_bucket_state: tauri::State<'_, model::integrity::State>,
  model_stats_bucket_state: tauri::State<'_, model::stats::State>,
  model_download_progress_state: tauri::State<'_, model::downloader::State>,
  model_config_state: tauri::State<'_, model::config::State>,

  path: &str,
) -> Result<(), String> {
  tokio::try_join!(
    async {
      tokio::fs::remove_file(&path)
        .await
        .map_err(|e| format!("{}", e))
    },
    remove_data(&model_integrity_bucket_state.0, &path),
    remove_data(&model_config_state.0, &path),
    remove_data(&model_stats_bucket_state.0, &path),
    remove_data(
      &model_download_progress_state.download_progress_bucket,
      &path
    )
  )?;

  Ok(())
}
