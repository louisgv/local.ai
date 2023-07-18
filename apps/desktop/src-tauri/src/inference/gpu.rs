#[tauri::command]
pub async fn check_gpu() -> Result<bool, String> {
  if llm::ggml_get_accelerator() != llm::GgmlAccelerator::None {
    Ok(true)
  } else {
    Ok(false)
  }
}
