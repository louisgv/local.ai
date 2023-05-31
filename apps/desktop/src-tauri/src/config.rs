use crate::kv_bucket;
use std::path::Path;
use tauri::AppHandle;

pub fn get_config_bucket(app_handle: AppHandle) -> kv::Bucket<'static, String, String> {
    kv_bucket::get_kv_bucket(app_handle, String::from("config"), String::from("v1")).unwrap()
}

const CONFIG_KEY_MODELS_DIRECTORY: &str = "models";

pub fn set_models_path(app_handle: AppHandle, abs_path: String) -> Result<bool, String> {
    // Check if abs_path is not empty and is an absolute path
    if abs_path.is_empty() || !Path::new(&abs_path).is_absolute() {
        return Ok(false);
    }

    get_config_bucket(app_handle)
        .set(&String::from(CONFIG_KEY_MODELS_DIRECTORY), &abs_path)
        .map(|_| true)
        .map_err(|e| format!("Error setting models path: {}", e))
}

pub fn get_models_path(app_handle: AppHandle) -> Result<String, String> {
    get_config_bucket(app_handle)
        .get(&String::from(CONFIG_KEY_MODELS_DIRECTORY))
        .map_err(|e| format!("Error getting models path: {}", e))
        .and_then(|opt| opt.ok_or_else(|| format!("Error getting models path")))
}
