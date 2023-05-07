use tauri::Window;
use tokio::io::AsyncWriteExt;
use tokio::sync::mpsc;
use tokio_stream::StreamExt;
use url::Url;

use tokio::fs::{File, OpenOptions};
use tokio::task;

const CHUNK_SIZE: usize = 1024 * 1024; // 1 MB

#[derive(Clone, serde::Serialize)]
struct Payload {
    md5_hash: String,
    progress: f64,
}

use crate::kv_bucket;
use kv::*;

#[derive(serde::Serialize, serde::Deserialize, PartialEq)]
pub struct DownloadedModelMetadata {
    file_path: String,
    download_url: String,
    md5_hash: String,
}

pub fn get_download_path(
    app_handle: &tauri::AppHandle,
    namespace: String,
    name: String,
) -> Result<String, Error> {
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();

    Ok(app_dir
        .join(namespace)
        .join(name)
        .to_string_lossy()
        .to_string())
}

pub fn get_model_metadata_bucket(
    app_handle: &tauri::AppHandle,
) -> kv::Bucket<'_, String, Json<DownloadedModelMetadata>> {
    kv_bucket::get_kv_bucket(
        &app_handle,
        String::from("data"),
        String::from("model_metadata"),
    )
    .unwrap()
}

#[tauri::command]
pub async fn download_model(
    window: Window,
    app_handle: tauri::AppHandle,
    download_url: String,
    md5_hash: String,
) -> Result<bool, String> {
    if md5_hash.is_empty() {
        Ok(false)
    } else {
        // Check if model_bucket already downloaded the file:

        // Otherwise, start the async download and sending download progress event:
        let model_bucket = get_model_metadata_bucket(&app_handle);
        let model_metadata = model_bucket.get(&md5_hash).ok();

        // if model_metadata.is_some() {
        //     Ok(false)
        // } else {

        let output_path = get_download_path(
            &app_handle,
            String::from("models"),
            extract_file_name(&download_url).unwrap(),
        )
        .unwrap();

        let value = Json(DownloadedModelMetadata {
            file_path: String::from(""),
            download_url: download_url.clone(),
            md5_hash: md5_hash.clone(),
        });

        model_bucket.set(&md5_hash, &value).ok();

        let (tx, mut rx) = mpsc::channel::<f64>(10);

        let progress_thread = std::thread::spawn(move || loop {
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

        let download_task =
            task::spawn(
                async move { download_file(&download_url, &output_path, tx.clone()).await },
            );

        Ok(true)
        // }
    }
}

async fn download_file(
    url: &str,
    output_path: &str,
    progress_tx: mpsc::Sender<f64>,
) -> Result<(), Box<dyn std::error::Error + Send>> {
    let client = reqwest::Client::new();

    let mut file = open_file(output_path).await?;
    let current_length = file
        .metadata()
        .await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send>)?
        .len();

    let mut request_builder = client.get(url);
    if current_length > 0 {
        request_builder = request_builder.header("Range", format!("bytes={}-", current_length));
    }

    let response = request_builder
        .send()
        .await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send>)?;

    let content_length = response
        .headers()
        .get(reqwest::header::CONTENT_LENGTH)
        .ok_or_else(|| {
            Box::new(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                "Missing Content-Length header",
            )) as Box<dyn std::error::Error + Send>
        })?
        .to_str()
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send>)?
        .parse::<u64>()
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send>)?;

    let total_length = current_length + content_length;

    let mut downloaded: u64 = current_length;

    let mut stream = response.bytes_stream();
    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send>)?;
        file.write_all(&chunk)
            .await
            .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send>)?;
        downloaded += chunk.len() as u64;
        let progress = downloaded as f64 / total_length as f64 * 100.0;
        progress_tx
            .send(progress)
            .await
            .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send>)?;
    }

    Ok(())
}

async fn open_file(path: &str) -> Result<File, Box<dyn std::error::Error + Send>> {
    let file = OpenOptions::new()
        .write(true)
        .create(true)
        .open(path)
        .await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send>)?;
    Ok(file)
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
