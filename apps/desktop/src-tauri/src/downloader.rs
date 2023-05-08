use crate::{kv_bucket, models_directory::get_default_models_path_buf};
use anyhow::{Context, Result};
use kv::*;
use serde::{Deserialize, Serialize};
use std::error::Error;
use tauri::{AppHandle, Window};
use tokio::{
    fs::{File, OpenOptions},
    io::AsyncWriteExt,
    sync::mpsc,
    task,
};
use tokio_stream::StreamExt;
use url::Url;

// use md5::{Digest, Md5};
// use std::fs::File;
// use std::io::{BufReader, Read};

#[derive(Clone, Serialize)]
struct Payload {
    md5_hash: String,
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
    download_url: String,
    md5_hash: String,
) -> Result<bool, String> {
    println!("download_model: {}", download_url);
    println!("md5_hash: {}", md5_hash);

    if md5_hash.is_empty() {
        return Ok(false);
    }

    let model_bucket = get_model_metadata_bucket(&app_handle);

    let file_name = extract_file_name(&download_url).unwrap();

    let output_path = get_default_models_path_buf(&app_handle)
        .await
        .join(&file_name)
        .display()
        .to_string();

    println!("output_path: {}", output_path);

    let value = Json(ModelMetadata {
        path: output_path.clone(),
        hash: md5_hash.clone(),
        download_url: download_url.clone(),
    });

    model_bucket.set(&output_path, &value).ok();

    let (tx, mut rx) = mpsc::channel::<f64>(10);

    std::thread::spawn(move || loop {
        if let Some(progress) = rx.blocking_recv() {
            window
                .emit(
                    "download-progress",
                    Payload {
                        md5_hash: md5_hash.clone(),
                        progress,
                    },
                )
                .unwrap();
        } else {
            break;
        }
    });

    task::spawn(async move {
        match download_file(&download_url, &output_path, tx.clone()).await {
            Ok(_) => {
                // Handle the success case, if needed
            }
            Err(e) => {
                // Handle the error case, e.g., log the error
                eprintln!("Error downloading file: {}", e);
            }
        }
    });

    Ok(true)
}

async fn download_file(
    url: &str,
    output_path: &str,
    progress_tx: mpsc::Sender<f64>,
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
        progress_tx
            .send(progress)
            .await
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
