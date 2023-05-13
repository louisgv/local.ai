use crate::kv_bucket;
use digest::Digest;
use kv::Json;
use md5::Md5;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::path::Path;
use std::sync::Mutex;
use tauri::AppHandle;
use tokio::fs::File;
use tokio::io::{self, AsyncReadExt};

static BUCKET_LOCK: Lazy<Mutex<()>> = Lazy::new(|| Mutex::new(()));

#[derive(Serialize, Deserialize, PartialEq, Clone)]
pub struct ModelIntegrity {
    md5: String,
    sha256: String,
    blake3: String,
}

// Key is absolute file path in the file system
pub fn get_model_integrity_bucket(
    app_handle: &AppHandle,
) -> kv::Bucket<'_, String, Json<ModelIntegrity>> {
    kv_bucket::get_kv_bucket(
        app_handle,
        String::from("model_integrity"),
        String::from("v1"),
    )
    .unwrap()
}

const BUFFER_SIZE: usize = 42 * 1024 * 1024; // 42 MiB buffer

pub async fn compute_integrity<P: AsRef<Path>>(path: P) -> Result<ModelIntegrity, io::Error> {
    let mut file = File::open(path).await?;
    let mut buffer = vec![0u8; BUFFER_SIZE];
    let mut hasher_md5 = Md5::new();
    let mut hasher_sha256 = Sha256::new();
    let mut hasher_blake3 = blake3::Hasher::new();

    loop {
        let bytes_read = file.read(&mut buffer).await?;
        if bytes_read == 0 {
            break;
        }
        let chunk = &buffer[..bytes_read];
        hasher_md5.update(chunk);
        hasher_sha256.update(chunk);
        hasher_blake3.update(chunk);
    }

    let hash_md5 = hasher_md5.finalize();
    let hash_sha256 = hasher_sha256.finalize();
    let hash_blake3 = hasher_blake3.finalize();

    Ok(ModelIntegrity {
        md5: format!("{:x}", hash_md5),
        sha256: format!("{:x}", hash_sha256),
        blake3: format!("{}", hash_blake3),
    })
}

#[tauri::command]
pub async fn get_cached_integrity(
    app_handle: AppHandle,
    path: &str,
) -> Result<ModelIntegrity, String> {
    let _guard = BUCKET_LOCK.lock().unwrap();
    let model_checksum_bucket = get_model_integrity_bucket(&app_handle);

    let file_path = String::from(path);

    match model_checksum_bucket.get(&file_path) {
        Ok(Some(value)) => return Ok(value.0),
        Ok(None) => return Err(format!("No cached hash for {}", path)),
        Err(e) => return Err(format!("Error retrieving cached hash for {}: {}", path, e)),
    }
}

#[tauri::command]
pub async fn get_integrity(app_handle: AppHandle, path: &str) -> Result<ModelIntegrity, String> {
    let integrity = compute_integrity(path).await.unwrap();

    let _guard = BUCKET_LOCK.lock().unwrap();

    let model_checksum_bucket = get_model_integrity_bucket(&app_handle);

    let file_path = String::from(path);

    match model_checksum_bucket.set(&file_path, &Json(integrity.clone())) {
        Ok(_) => Ok(integrity),
        Err(e) => return Err(format!("Error caching hash for {}: {}", path, e)),
    }
}
