#[tauri::command]
pub async fn check_gpu() -> Result<bool, String> {
  // TODO: actually check if Metal is available in the future (?)
  if cfg!(all(target_os = "macos", target_arch = "aarch64")) {
    Ok(true)
  } else {
    Ok(false)
  }
}
