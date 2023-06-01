use crate::kv_bucket::{get_state_json, StateBucket};
use crate::{kv_bucket, models_directory::get_current_models_path};
use kv::*;
use parking_lot::{Mutex, RwLock};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::{error::Error, path::Path};
use tauri::{App, Manager};
use tauri::{AppHandle, Window};
use tokio::{
    fs::{File, OpenOptions},
    io::AsyncWriteExt,
};
use tokio_stream::StreamExt;

// use std::fs::File;
// use std::io::{BufReader, Read};
// Study this perhaps: https://github.com/rfdonnelly/tauri-async-example/blob/main/src-tauri/src/main.rs

#[derive(Serialize, Deserialize, Clone, PartialEq, Default)]
pub enum DownloadState {
    #[default]
    #[serde(rename = "idle")]
    Idle,
    #[serde(rename = "downloading")]
    Downloading,
    #[serde(rename = "completed")]
    Completed,
}
// Download path -> Download join handler
#[derive(Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct DownloadProgressData {
    path: String,
    digest: String,
    progress: f64,
    #[serde(rename = "downloadUrl")]
    download_url: String,
    #[serde(rename = "downloadState")]
    download_state: DownloadState,
}

type DownloadProgressBucket = StateBucket<Json<DownloadProgressData>>;
type DownloadStateMap = Arc<Mutex<HashMap<String, Arc<Mutex<DownloadState>>>>>;

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
}

#[tauri::command]
pub async fn get_download_progress(
    state: tauri::State<'_, self::State>,
    path: &str,
) -> Result<DownloadProgressData, String> {
    let download_progress_bucket = state.download_progress_bucket.lock();

    let file_path = String::from(path);

    match download_progress_bucket.get(&file_path) {
        Ok(Some(value)) => return Ok(value.0),
        Ok(None) => return Err(format!("No download progress for {}", path)),
        Err(e) => {
            return Err(format!(
                "Error getting download progress for {}: {}",
                path, e
            ))
        }
    }
}

fn spawn_download_threads(
    output_path: String,
    download_progress_bucket: DownloadProgressBucket,
    download_state_map: DownloadStateMap,
    window_arc: Arc<RwLock<Window>>,
) {
    let download_state_arc = Arc::new(Mutex::new(DownloadState::Downloading));

    download_state_map
        .lock()
        .insert(output_path.clone(), download_state_arc.clone());

    let (sender, receiver) = flume::unbounded::<f64>();

    tauri::async_runtime::spawn({
        let output_path = output_path.clone();
        let window_arc = window_arc.clone();

        async move {
            let event_name = format!("download_progress:{}", output_path);
            while let Ok(progress) = receiver.recv_async().await {
                window_arc
                    .read()
                    .emit(
                        &event_name,
                        DownloadProgressData {
                            progress,
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

        let window_arc = window_arc.clone();

        let download_url = get_state_json(&dlpb_arc, &output_path).0.download_url;

        async move {
            let event_name = format!("download_progress:{}", output_path);
            match download_file(&download_url, &output_path, &sender, &download_state_arc).await {
                Ok(i) => {
                    let download_progress_bucket = dlpb_arc.lock();

                    let download_progress = get_state_json(&dlpb_arc, &output_path).0;

                    let payload = DownloadProgressData {
                        progress: i,
                        download_state: if i >= 100.0 {
                            DownloadState::Completed
                        } else {
                            DownloadState::Idle
                        },
                        ..download_progress
                    };

                    window_arc
                        .read()
                        .emit(&event_name, payload.clone())
                        .unwrap();

                    match download_progress_bucket.set(&output_path, &Json(payload)) {
                        Ok(_) => println!("Download progress updated"),
                        Err(e) => println!("Error updating download progress: {}", e),
                    }
                }
                Err(e) => {
                    // Handle the error case, e.g., log the error
                    eprintln!("Error downloading file: {}", e);
                }
            }
        }
    });
}

#[tauri::command]
pub async fn resume_download(
    window: Window,
    state: tauri::State<'_, self::State>,
    path: &str,
) -> Result<(), String> {
    let output_path = String::from(path);

    spawn_download_threads(
        output_path,
        state.download_progress_bucket.clone(),
        state.download_state_map.clone(),
        Arc::new(RwLock::new(window)),
    );
    Ok(())
}

#[tauri::command]
pub async fn start_download(
    window: Window,
    app_handle: AppHandle,
    state: tauri::State<'_, State>,
    name: String,
    download_url: String,
    digest: String,
) -> Result<(), String> {
    println!("download_model: {}", download_url);
    println!("digest: {}", digest);

    let models_path = get_current_models_path(app_handle).await?;

    let file_name = name;

    let output_path = Path::new(&models_path)
        .join(&file_name)
        .display()
        .to_string();

    println!("output_path: {}", output_path);

    state
        .download_progress_bucket
        .lock()
        .set(
            &output_path,
            &Json(DownloadProgressData {
                path: output_path.clone(),
                digest,
                download_url,
                download_state: DownloadState::Downloading,
                ..Default::default()
            }),
        )
        .ok();

    spawn_download_threads(
        output_path,
        state.download_progress_bucket.clone(),
        state.download_state_map.clone(),
        Arc::new(RwLock::new(window)),
    );

    Ok(())
}

#[tauri::command]
pub async fn pause_download(path: String, state: tauri::State<'_, State>) -> Result<(), String> {
    let download_state_map = state.download_state_map.lock();

    let download_state_arc = download_state_map.get(&path).unwrap().clone();

    let mut download_state = download_state_arc.lock();

    *download_state = DownloadState::Idle;

    Ok(())
}

async fn download_file(
    url: &str,
    output_path: &str,
    progress_sender: &flume::Sender<f64>,
    download_state_arc: &Arc<Mutex<DownloadState>>,
) -> Result<f64, Box<dyn Error>> {
    let client = reqwest::Client::new();

    println!("Downloading {} to {}", url, output_path);

    let mut file = open_file(output_path).await?;
    let current_length = file.metadata().await?.len();

    let mut request_builder = client.get(url);
    if current_length > 0 {
        request_builder = request_builder.header("Range", format!("bytes={}-", current_length));
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
        progress_sender.send(progress)?;

        let download_state = download_state_arc.lock();
        if *download_state == DownloadState::Idle {
            return Ok(progress);
        }
    }

    Ok(100.0)
}

async fn open_file(path: &str) -> Result<File, Box<dyn Error>> {
    OpenOptions::new()
        .write(true)
        .create(true)
        .open(path)
        .await
        .map_err(|e| Box::new(e) as Box<dyn Error>)
}
