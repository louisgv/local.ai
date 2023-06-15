use crate::kv_bucket::{self, StateBucket};

use kv::Json;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use tauri::Manager;

#[derive(Serialize, Deserialize, PartialEq, Clone)]
pub struct ModelConfig {
  pub vocabulary: String,
}

#[derive(Clone)]
pub struct State(pub StateBucket<Json<ModelConfig>>);

impl State {
  pub fn new(app: &mut tauri::App) -> Result<(), String> {
    let bucket = kv_bucket::get_kv_bucket(
      app.app_handle(),
      String::from("model_config"),
      String::from("v1"),
    )?;

    app.manage(State(Arc::new(Mutex::new(bucket))));
    Ok(())
  }
}

#[tauri::command]
pub fn get_model_config(
  state: tauri::State<'_, State>,
  path: &str,
) -> Result<String, String> {
  let file_path = String::from(path);
  let bucket = state.0.lock();

  match bucket.get(&file_path) {
    Ok(Some(value)) => return Ok(value),
    Ok(None) => Err(format!("No cached model type for {}", path)),
    Err(e) => Err(format!("Error retrieving model type for {}: {}", path, e)),
  }
}

#[tauri::command]
pub async fn set_model_config(
  state: tauri::State<'_, State>,
  path: &str,
  model_type: &str,
) -> Result<(), String> {
  let file_path = String::from(path);
  let bucket = state.0.lock();

  bucket
    .set(&file_path, &String::from(model_type))
    .map_err(|e| format!("{}", e))?;

  bucket.flush().map_err(|e| format!("{}", e))?;

  Ok(())
}
