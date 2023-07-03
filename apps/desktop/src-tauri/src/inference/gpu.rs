#[tauri::command]
pub async fn check_gpu<'a>() -> Result<bool, String> {
  #[cfg(target = "aarch64-apple-darwin")]
  {
    return Ok(true);
  }

  Ok(false)
}
