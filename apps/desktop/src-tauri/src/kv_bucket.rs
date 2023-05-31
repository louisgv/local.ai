use std::sync::Arc;

use kv::*;
use parking_lot::Mutex;
use tauri::AppHandle;

pub fn get_kv_bucket<T: Value>(
    app_handle: AppHandle,
    namespace: String,
    name: String,
) -> Result<Bucket<'static, String, T>, String> {
    let app_dir = match app_handle.path_resolver().app_data_dir() {
        Some(dir) => dir.to_owned(),
        None => return Err(String::from("Could not get app data dir.")),
    };
    let storage_path = app_dir.join(namespace).to_string_lossy().to_string();

    let cfg = Config::new(storage_path);
    let store =
        Store::new(cfg).map_err(|err| format!("Could not create storage bucket: {}", err))?;

    store
        .bucket::<String, T>(Some(&name))
        .map_err(|err| format!("Could not get bucket: {}", err))
}

pub type StateBucket<T> = Arc<Mutex<Bucket<'static, String, T>>>;
