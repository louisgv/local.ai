use crate::{kv_bucket, models_directory::get_current_models_path};
use kv::*;
use parking_lot::Mutex;
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

// Download path -> Download join handler
#[derive(Default)]
struct DownloadHandlerMap(Arc<Mutex<HashMap<String, String>>>);

#[derive(Clone, Serialize, Deserialize, PartialEq, Default)]
struct DownloadProgressData {
    path: String,
    digest: String,
    progress: f64,
    download_url: Option<String>,
    finished: bool,
}

type DownloadProgressBucket = Arc<Mutex<Bucket<'static, String, Json<DownloadProgressData>>>>;

#[derive(Clone)]
pub struct State(DownloadProgressBucket);

impl State {
    pub fn new(app: &mut App) -> Result<(), String> {
        let bucket = kv_bucket::get_kv_bucket(
            app.app_handle(),
            String::from("download_state"),
            String::from("v1"),
        )?;

        app.manage(State(Arc::new(Mutex::new(bucket))));
        Ok(())
    }
}

#[tauri::command]
pub async fn download_model(
    window: Window,
    app_handle: AppHandle,
    download_state: tauri::State<'_, State>,
    name: String,
    download_url: String,
    digest: String,
) -> Result<(), String> {
    println!("download_model: {}", download_url);
    println!("digest: {}", digest);
    let models_path = get_current_models_path(app_handle).await?;

    let model_bucket = download_state.0.lock();

    let file_name = name;

    let output_path = Path::new(&models_path)
        .join(&file_name)
        .display()
        .to_string();

    println!("output_path: {}", output_path);

    model_bucket
        .set(
            &output_path,
            &Json(DownloadProgressData {
                path: output_path.clone(),
                digest: digest.clone(),
                download_url: Some(download_url.clone()),
                ..Default::default()
            }),
        )
        .ok();

    let (sender, receiver) = flume::unbounded::<f64>();

    let op_clone = output_path.clone();
    tauri::async_runtime::spawn(async move {
        match receiver.recv_async().await {
            Ok(progress) => {
                let payload = DownloadProgressData {
                    path: op_clone,
                    digest: digest.clone(),
                    progress,
                    ..Default::default()
                };
                window.emit("download_progress", payload).unwrap();
            }
            Err(e) => {
                eprintln!("Error receiving progress: {}", e);
            }
        };
    });

    let op_clone = output_path.clone();
    tauri::async_runtime::spawn(async move {
        match download_file(&download_url, &op_clone, sender.clone()).await {
            Ok(_) => {
                // Handle the success case, if needed
            }
            Err(e) => {
                // Handle the error case, e.g., log the error
                eprintln!("Error downloading file: {}", e);
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn pause_download_model(
    window: Window,
    app_handle: AppHandle,
    name: String,
    download_url: String,
    digest: String,
) -> Result<(), String> {
    Ok(())
}

async fn download_file(
    url: &str,
    output_path: &str,
    progress_sender: flume::Sender<f64>,
) -> Result<(), Box<dyn Error>> {
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
        // TODO: add a condition here such that
        let chunk = chunk?;
        file.write_all(&chunk).await?;
        downloaded += chunk.len() as u64;
        let progress = downloaded as f64 / total_length as f64 * 100.0;
        progress_sender.send(progress)?;
    }

    Ok(())
}

async fn open_file(path: &str) -> Result<File, Box<dyn Error>> {
    OpenOptions::new()
        .write(true)
        .create(true)
        .open(path)
        .await
        .map_err(|e| Box::new(e) as Box<dyn Error>)
}
