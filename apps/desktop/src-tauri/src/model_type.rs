use crate::kv_bucket;
use md5::Context;
use once_cell::sync::Lazy;
use std::fs::File;
use std::io::{self, Read};
use std::path::Path;
use std::sync::Mutex;
use tauri::AppHandle;

static BUCKET_LOCK: Lazy<Mutex<()>> = Lazy::new(|| Mutex::new(()));

// Key is absolute file path in the file system
pub fn get_model_type_bucket(app_handle: &AppHandle) -> kv::Bucket<'_, String, String> {
    kv_bucket::get_kv_bucket(app_handle, String::from("data"), String::from("model_type")).unwrap()
}

#[tauri::command]
pub async fn get_cached_model_type(app_handle: AppHandle, path: &str) -> Result<String, String> {
    let _guard = BUCKET_LOCK.lock().unwrap();
    let model_checksum_bucket = get_model_checksum_bucket(&app_handle);

    let file_path = String::from(path);

    match model_checksum_bucket.get(&file_path) {
        Ok(Some(value)) => return Ok(value),
        Ok(None) => return Err(format!("No cached hash for {}", path)),
        Err(e) => return Err(format!("Error retrieving cached hash for {}: {}", path, e)),
    }
}

#[tauri::command]
pub async fn set_model_type(app_handle: AppHandle, path: &str) -> Result<String, String> {
    let hash = match calculate_md5(&path) {
        Ok(md5_hash) => md5_hash,
        Err(e) => return Err(format!("Error calculating MD5 for {}: {}", path, e)),
    };

    let model_checksum_bucket = get_model_checksum_bucket(&app_handle);

    let file_path = String::from(path);

    model_checksum_bucket.set(&file_path, &hash);

    Ok(hash)
}
