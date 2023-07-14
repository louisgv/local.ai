use crate::config::ConfigKey;
use crate::model::integrity::{compute_file_integrity, ModelIntegrity};
use crate::utils::kv_bucket::{self, get_state_json, StateBucket};
use kv::Json;
use parking_lot::{Mutex, RwLock};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::{error::Error, path::Path};
use tauri::{App, Manager, Window};
use tokio::{
  fs::{File, OpenOptions},
  io::AsyncWriteExt,
};
use tokio_stream::StreamExt;

// use std::fs::File;
// use std::io::{BufReader, Read};
// Study this perhaps: https://github.com/rfdonnelly/tauri-async-example/blob/main/src-tauri/src/main.rs

#[derive(Serialize, Deserialize, Clone, PartialEq, Default, Debug)]
pub enum DownloadState {
  #[default]
  #[serde(rename = "idle")]
  Idle,
  #[serde(rename = "downloading")]
  Downloading,
  #[serde(rename = "validating")]
  Validating,
  #[serde(rename = "completed")]
  Completed,
  #[serde(rename = "errored")]
  Errored,
}
// Download path -> Download join handler
#[derive(Clone, Serialize, Deserialize, PartialEq, Default, Debug)]
pub struct DownloadProgressData {
  path: String,
  digest: String,
  progress: f64,
  size: u64,

  #[serde(rename = "eventId")]
  event_id: String,
  #[serde(rename = "downloadUrl")]
  download_url: String,
  #[serde(rename = "downloadState")]
  download_state: DownloadState,

  error: Option<String>,
}

type DownloadProgressBucket = StateBucket<Json<DownloadProgressData>>;
type DownloadStateMap = Arc<Mutex<HashMap<String, Arc<RwLock<DownloadState>>>>>;

#[derive(Clone)]
pub struct State {
  pub download_progress_bucket: DownloadProgressBucket,
  pub download_state_map: DownloadStateMap,
}

impl State {
  pub fn new(app: &mut App) -> Result<(), String> {
    let bucket = kv_bucket::get_kv_bucket(
      app.app_handle(),
      String::from("download_state"),
      String::from("v1"),
    )?;

    app.manage(State {
      download_progress_bucket: Arc::new(Mutex::new(bucket)),
      download_state_map: Arc::new(Mutex::new(HashMap::new())),
    });
    Ok(())
  }

  pub fn set_download_progress(
    &self,
    path: &String,
    data: DownloadProgressData,
  ) -> Result<(), String> {
    let dl_progress = self.download_progress_bucket.lock();

    dl_progress
      .set(path, &Json(data))
      .map_err(|e| e.to_string())?;

    dl_progress.flush().map_err(|e| e.to_string())?;

    Ok(())
  }

  pub fn assert_download_state(
    &self,
    output_path: &str,
    expected_state: DownloadState,
  ) -> Result<(), String> {
    let download_state_map = self.download_state_map.lock();

    let current_state_arc = match download_state_map.get(output_path) {
      Some(arc) => arc.clone(),
      None => return Ok(()),
    };
    let current_state = current_state_arc.read();
    if *current_state != expected_state {
      return Err(format!(
        "Download state for {} is {:?}, expected {:?}",
        output_path, current_state, expected_state
      ));
    }

    Ok(())
  }
}

#[tauri::command]
pub async fn get_download_progress(
  state: tauri::State<'_, self::State>,
  path: &str,
) -> Result<DownloadProgressData, String> {
  let file_path = String::from(path);
  let download_progress_bucket = state.download_progress_bucket.lock();

  match download_progress_bucket.get(&file_path) {
    Ok(Some(value)) => Ok(value.0),
    Ok(None) => Err(format!("No download progress for {}", path)),
    Err(e) => Err(format!(
      "Error getting download progress for {}: {}",
      path, e
    )),
  }
}

#[tauri::command]
pub async fn pause_download(
  path: String,
  state: tauri::State<'_, State>,
) -> Result<(), String> {
  let download_state_map = state.download_state_map.lock();

  if let Some(download_state_arc) = download_state_map.get(&path) {
    let download_state = download_state_arc.clone();
    *download_state.write() = DownloadState::Idle;
  }

  Ok(())
}

#[tauri::command]
pub async fn resume_download(
  window: Window,
  state: tauri::State<'_, self::State>,
  model_integrity_state: tauri::State<'_, crate::model::integrity::State>,
  path: &str,
) -> Result<(), String> {
  let output_path = String::from(path);

  state.assert_download_state(&output_path, DownloadState::Idle)?;

  spawn_download_threads(
    &output_path,
    state.download_progress_bucket.clone(),
    state.download_state_map.clone(),
    model_integrity_state.0.clone(),
    Arc::new(RwLock::new(window)),
  );
  Ok(())
}

#[tauri::command]
pub async fn start_download(
  window: Window,
  state: tauri::State<'_, State>,
  config_state: tauri::State<'_, crate::config::State>,
  model_integrity_state: tauri::State<'_, crate::model::integrity::State>,
  name: String,
  download_url: String,
  digest: String,
) -> Result<String, String> {
  println!("download_model: {}", download_url);
  println!("digest: {}", digest);

  let models_path = config_state.read(ConfigKey::ModelsDirectory)?;

  let output_path_buf = Path::new(&models_path).join(format!("{}.bin", name));
  let output_path = output_path_buf.display().to_string();
  println!("output_path: {}", output_path);

  if output_path_buf.exists() {
    return Err(format!("File already exists: {}", output_path));
  }

  println!("output_path: {:?}", output_path);

  state.set_download_progress(
    &output_path,
    DownloadProgressData {
      path: output_path.clone(),
      digest,
      download_url,
      download_state: DownloadState::Downloading,
      event_id: format!(
        "download_progress:{}",
        blake3::hash(output_path.as_bytes())
      ),
      ..Default::default()
    },
  )?;

  spawn_download_threads(
    &output_path,
    state.download_progress_bucket.clone(),
    state.download_state_map.clone(),
    model_integrity_state.0.clone(),
    Arc::new(RwLock::new(window)),
  );

  Ok(output_path)
}

fn spawn_download_threads(
  output_path: &String,
  download_progress_bucket: DownloadProgressBucket,
  download_state_map: DownloadStateMap,
  model_integrity_bucket_state: StateBucket<Json<ModelIntegrity>>,
  window_arc: Arc<RwLock<Window>>,
) {
  let download_state_arc = Arc::new(RwLock::new(DownloadState::Downloading));

  let (sender, receiver) = flume::unbounded::<(f64, u64)>();

  tauri::async_runtime::spawn({
    let window_arc = window_arc.clone();
    let dlpb_arc = download_progress_bucket.clone();
    let dlp_data = get_state_json(&dlpb_arc, &output_path).0;
    let event_id = dlp_data.event_id;

    async move {
      while let Ok((progress, size)) = receiver.recv_async().await {
        window_arc
          .read()
          .emit(
            &event_id,
            DownloadProgressData {
              progress,
              size,
              download_state: DownloadState::Downloading,
              ..Default::default()
            },
          )
          .unwrap();
      }
    }
  });

  tauri::async_runtime::spawn({
    let output_path = output_path.clone();

    let dlpb_arc = download_progress_bucket.clone();

    let dlp_data = get_state_json(&dlpb_arc, &output_path).0;

    let download_url = dlp_data.download_url;

    let event_id = dlp_data.event_id;

    let download_state_arc = download_state_arc.clone();

    let model_integrity_bucket_state = model_integrity_bucket_state.clone();

    let window_arc = window_arc.clone();
    let window_emit = move |payload| {
      window_arc.read().emit(&event_id, payload).unwrap();
    };

    async move {
      let mut final_payload = match download_file(
        &download_url,
        &output_path,
        &sender,
        download_state_arc,
      )
      .await
      {
        Ok((progress, size)) => {
          println!("On final progress update: {}", progress);

          let download_state = if progress >= 100.0 {
            DownloadState::Completed
          } else {
            DownloadState::Idle
          };

          println!("Download state: {:?}", download_state);

          let download_progress = get_state_json(&dlpb_arc, &output_path).0;

          DownloadProgressData {
            progress,
            size,
            download_state,
            ..download_progress
          }
        }
        Err(e) => {
          // Handle the error case, e.g., log the error
          eprintln!("Error downloading file: {}", e);
          DownloadProgressData {
            download_state: DownloadState::Errored,
            error: Some(e.to_string()),
            ..Default::default()
          }
        }
      };

      if final_payload.download_state == DownloadState::Completed {
        let tmp_final_payload = final_payload.clone();
        window_emit(DownloadProgressData {
          download_state: DownloadState::Validating,
          ..tmp_final_payload.clone()
        });

        let model_integrity =
          compute_file_integrity(output_path.as_str()).await.unwrap();

        let model_integrity_bucket = model_integrity_bucket_state.lock();

        match model_integrity_bucket
          .set(&output_path, &Json(model_integrity.clone()))
        {
          Ok(_) => println!("Model integrity updated"),
          Err(e) => println!("Error updating model integrity: {}", e),
        };

        model_integrity_bucket.flush().unwrap();

        if model_integrity.blake3 != tmp_final_payload.digest
          && tmp_final_payload.digest.starts_with("PENCIL | ")
        // PENCIL indicates the model is experimental
        {
          final_payload.download_state = DownloadState::Errored;
          final_payload.error = Some(format!(
            "Integrity check failed, expected {}, received {}. Please remove the file and try again.",
            model_integrity.blake3, tmp_final_payload.digest

          ));
        }
      }

      let payload = final_payload.clone();
      let download_progress_bucket = dlpb_arc.lock();

      match download_progress_bucket.set(&output_path, &Json(payload)) {
        Ok(_) => println!("Download progress updated"),
        Err(e) => println!("Error updating download progress: {}", e),
      };

      download_progress_bucket.flush().unwrap();

      window_emit(final_payload.clone());
    }
  });

  download_state_map
    .lock()
    .insert(output_path.clone(), download_state_arc);
}

async fn download_file(
  url: &str,
  output_path: &str,
  progress_sender: &flume::Sender<(f64, u64)>,
  download_state_arc: Arc<RwLock<DownloadState>>,
) -> Result<(f64, u64), Box<dyn Error>> {
  let client = reqwest::Client::new();

  println!("Downloading {} to {}", url, output_path);

  let mut file = open_file(output_path).await?;
  let current_length = file.metadata().await?.len();

  let mut request_builder = client.get(url);
  if current_length > 0 {
    request_builder =
      request_builder.header("Range", format!("bytes={}-", current_length));
  }

  let response = request_builder.send().await?;

  let content_length = response
    .headers()
    .get(reqwest::header::CONTENT_LENGTH)
    .ok_or_else(|| {
      std::io::Error::new(
        std::io::ErrorKind::NotFound,
        "Missing Content-Length header",
      )
    })?
    .to_str()?
    .parse::<u64>()?;

  let total_length = current_length + content_length;

  let mut downloaded: u64 = current_length;

  let mut stream = response.bytes_stream();
  while let Some(chunk) = stream.next().await {
    let chunk = chunk?;
    file.write_all(&chunk).await?;
    downloaded += chunk.len() as u64;
    let progress = downloaded as f64 / total_length as f64 * 100.0;

    if *download_state_arc.read() == DownloadState::Idle {
      file.flush().await?;
      file.sync_all().await?;
      return Ok((progress, downloaded));
    } else {
      progress_sender.send_async((progress, downloaded)).await?;
    }
  }

  file.flush().await?;
  Ok((100.0, downloaded))
}

async fn open_file(path: &str) -> Result<File, Box<dyn Error>> {
  OpenOptions::new()
    .read(true)
    .create(true)
    .append(true)
    .open(path)
    .await
    .map_err(|e| Box::new(e) as Box<dyn Error>)
}
