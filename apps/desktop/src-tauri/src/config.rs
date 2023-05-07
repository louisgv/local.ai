pub fn get_config_settings_bucket(app_handle: &tauri::AppHandle) -> kv::Bucket<'_, String, String> {
    kv_bucket::get_kv_bucket(
        &app_handle,
        String::from("config"),
        String::from("settings"),
    )
    .unwrap()
}

#[tauri::command]
pub fn set_models_path(app_handle: tauri::AppHandle, abs_path: String) -> Result<bool, String> {
    if abs_path.is_empty() {
        Ok(false)
    } else {
        let settings_bucket = get_crx_bucket(&app_handle);

        settings_bucket
            .set(&String::from("models_path"), &abs_path)
            .ok();

        Ok(true)
    }
}

#[tauri::command]
pub fn get_models_path(app_handle: tauri::AppHandle) -> Result<String, String> {
    let settings_bucket = get_crx_bucket(&app_handle);

    let path = settings_bucket.get(&String::from("models_path")).ok();

    Ok(path)
}
