use crate::{kv_bucket, models_directory::get_current_models_path};
use anyhow::{Context, Result};
use kv::*;
use serde::{Deserialize, Serialize};
use std::{error::Error, path::Path};
use tauri::{AppHandle, Window};
use tokio::{
    fs::{File, OpenOptions},
    io::AsyncWriteExt,
};
use tokio_stream::StreamExt;
use url::Url;

// use md5::{Digest, Md5};
// use std::fs::File;
// use std::io::{BufReader, Read};
// Study this perhaps: https://github.com/rfdonnelly/tauri-async-example/blob/main/src-tauri/src/main.rs

#[derive(Clone, Serialize)]
struct ProgressData {
    path: String,
    digest: String,
    progress: f64,
}

#[derive(Serialize, Deserialize, PartialEq)]
pub struct ModelMetadata {
    path: String,
    hash: String,
    download_url: String,
}

// Key is absolute file path in the file system
pub fn get_model_metadata_bucket(
    app_handle: &AppHandle,
) -> kv::Bucket<'_, String, Json<ModelMetadata>> {
    kv_bucket::get_kv_bucket(
        app_handle,
        String::from("data"),
        String::from("model_metadata"),
    )
    .unwrap()
}

#[tauri::command]
pub async fn download_model(
    window: Window,
    app_handle: AppHandle,
    name: String,
    download_url: String,
    digest: String,
) -> Result<(), String> {
    println!("download_model: {}", download_url);
    println!("digest: {}", digest);

    if digest.is_empty() {
        // Might remove this in the future for arbitrary download
        return Err(format!("blake3 required for integrity check"));
    }

    let model_bucket = get_model_metadata_bucket(&app_handle);

    let file_name = name;
    let models_path = get_current_models_path(&app_handle).await?;

    let output_path = Path::new(&models_path)
        .join(&file_name)
        .display()
        .to_string();

    println!("output_path: {}", output_path);

    let value = Json(ModelMetadata {
        path: output_path.clone(),
        hash: digest.clone(),
        download_url: download_url.clone(),
    });

    model_bucket.set(&output_path, &value).ok();

    let (sender, receiver) = flume::unbounded::<f64>();

    let op_clone = output_path.clone();
    tauri::async_runtime::spawn(async move {
        match receiver.recv_async().await {
            Ok(progress) => {
                let payload = ProgressData {
                    path: op_clone,
                    digest: digest.clone(),
                    progress,
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
        let chunk = chunk.context("Failed to read chunk")?;
        file.write_all(&chunk)
            .await
            .context("Failed to write chunk")?;
        downloaded += chunk.len() as u64;
        let progress = downloaded as f64 / total_length as f64 * 100.0;
        progress_sender
            .send(progress)
            .context("Failed to send progress")?;
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

fn extract_file_name(uri: &str) -> Result<String, url::ParseError> {
    let parsed_url = Url::parse(uri)?;
    let file_name = parsed_url
        .path_segments()
        .and_then(|segments| segments.last())
        .map(|name| name.to_string())
        .ok_or_else(|| url::ParseError::RelativeUrlWithoutBase)?;
    Ok(file_name)
}
