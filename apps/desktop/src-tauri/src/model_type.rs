use crate::kv_bucket;
use once_cell::sync::Lazy;
use std::sync::Mutex;
use tauri::AppHandle;

static MODEL_TYPE_BUCKET_LOCK: Lazy<Mutex<()>> = Lazy::new(|| Mutex::new(()));

// Key is absolute file path in the file system
pub fn get_model_type_bucket(app_handle: &AppHandle) -> kv::Bucket<'_, String, String> {
    kv_bucket::get_kv_bucket(app_handle, String::from("model_type"), String::from("v1")).unwrap()
}

#[tauri::command]
pub async fn get_cached_model_type(app_handle: AppHandle, path: &str) -> Result<String, String> {
    let _guard = MODEL_TYPE_BUCKET_LOCK.lock().unwrap();
    let model_type_bucket = get_model_type_bucket(&app_handle);

    let file_path = String::from(path);

    match model_type_bucket.get(&file_path) {
        Ok(Some(value)) => return Ok(value),
        Ok(None) => return Err(format!("No cached model type for {}", path)),
        Err(e) => return Err(format!("Error retrieving model type for {}: {}", path, e)),
    }
}

#[tauri::command]
pub async fn set_model_type(
    app_handle: AppHandle,
    path: &str,
    model_type: &str,
) -> Result<bool, String> {
    let model_type_bucket = get_model_type_bucket(&app_handle);

    let file_path = String::from(path);

    match model_type_bucket.set(&file_path, &String::from(model_type)) {
        Ok(_) => return Ok(true),
        Err(e) => return Err(format!("Error setting model type for {}: {}", path, e)),
    }
}
