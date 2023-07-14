/// Thread as in chat/conversation thread
use chrono::Utc;
use rand::Rng;
use serde::{Deserialize, Serialize};
use tauri::Window;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt};

use crate::{
  config::ConfigKey,
  path::{DirectoryState, FileInfo},
};

static FILE_EXTENSION: &str = ".l.mdx";

fn sort_files(files: &mut Vec<FileInfo>) {
  files.retain(|f| f.path.ends_with(FILE_EXTENSION));
  files.sort_unstable_by(|a, b| b.modified.cmp(&a.modified));
}

#[tauri::command]
pub async fn initialize_threads_dir(
  config_bucket_state: tauri::State<'_, crate::config::State>,
) -> Result<DirectoryState, String> {
  let threads_path = config_bucket_state.read(ConfigKey::ThreadsDirectory)?;

  let mut files = crate::path::read_directory(threads_path.as_str()).await?;

  sort_files(&mut files);

  Ok(DirectoryState {
    path: threads_path,
    files,
  })
}

#[tauri::command]
pub async fn update_threads_dir(
  dir: &str,
  config_bucket_state: tauri::State<'_, crate::config::State>,
) -> Result<DirectoryState, String> {
  config_bucket_state.write(ConfigKey::ThreadsDirectory, dir)?;

  let mut files = crate::path::read_directory(dir).await?;

  sort_files(&mut files);

  Ok(DirectoryState {
    path: String::from(dir),
    files,
  })
}

static HEADER: &str = "---
date: {date}
icon: {icon}
---";

#[tauri::command]
pub async fn create_thread_file(
  config_bucket_state: tauri::State<'_, crate::config::State>,
) -> Result<FileInfo, String> {
  let date = Utc::now();

  let threads_path = config_bucket_state.read(ConfigKey::ThreadsDirectory)?;

  let threads_path_buf = std::path::PathBuf::from(&threads_path);

  let file_name = format!("{}{}", date.format("%Y%m%d_%H%M%S"), FILE_EXTENSION);

  let full_path = threads_path_buf.join(&file_name);
  let header_content =
    HEADER
      .replace("{date}", &date.to_string())
      .replace("{icon}", {
        let mut rng = rand::thread_rng();
        &rng.gen::<u32>().to_string()
      });

  // attempt to create the file
  match tokio::fs::write(&full_path, header_content).await {
    Ok(_) => Ok(FileInfo {
      path: full_path.display().to_string(),
      name: full_path.file_stem().unwrap().to_str().unwrap().to_string(),
      ..Default::default()
    }),
    Err(e) => Err(e.to_string()),
  }
}

#[tauri::command]
pub async fn delete_thread_file(path: &str) -> Result<(), String> {
  tokio::try_join!(async {
    tokio::fs::remove_file(&path)
      .await
      .map_err(|e| format!("{}", e))
  },)?;

  Ok(())
}

#[tauri::command]
pub async fn rename_thread_file(
  path: &str,
  new_name: &str,
) -> Result<FileInfo, String> {
  let path = std::path::Path::new(path);

  if let Some(parent) = path.parent() {
    let new_path = parent.join(format!("{}{}", new_name, FILE_EXTENSION));

    std::fs::rename(&path, &new_path)
      .map_err(|e| format!("Failed to rename file: {}", e))?;

    Ok(FileInfo {
      path: new_path.display().to_string(),
      name: new_path.file_stem().unwrap().to_str().unwrap().to_string(),
      ..Default::default()
    })
  } else {
    Err(String::from("Invalid file path"))
  }
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Default, Debug)]
pub struct ReadProgressData {
  line: String,
  done: bool,
}

#[tauri::command]
pub async fn read_thread_file(
  window: Window,
  path: &str,
  event_id: &str,
) -> Result<(), String> {
  tauri::async_runtime::spawn({
    // let window = window.clone();
    let path = path.to_string();
    let event_id = event_id.to_string();

    async move {
      let file = tokio::fs::File::open(path)
        .await
        .expect("Failed to open file");

      // create reader using file
      let reader = tokio::io::BufReader::new(file);
      // get iterator over lines
      let mut lines = reader.lines();

      while let Some(line) =
        lines.next_line().await.expect("Failed to read line")
      {
        window
          .emit(&event_id, ReadProgressData { line, done: false })
          .unwrap();
      }

      window
        .emit(
          &event_id,
          ReadProgressData {
            line: String::new(),
            done: true,
          },
        )
        .unwrap();
    }
  });

  Ok(())
}

#[tauri::command]
pub async fn append_thread_content(
  path: &str,
  content: &str,
) -> Result<(), String> {
  let mut file = tokio::fs::OpenOptions::new()
    .append(true)
    .open(path)
    .await
    .map_err(|e| format!("Failed to open file: {}", e))?;

  file
    .write_all(content.as_bytes())
    .await
    .map_err(|e| format!("Failed to write to file: {}", e))?;

  Ok(())
}
