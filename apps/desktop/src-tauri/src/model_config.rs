use crate::kv_bucket::{self, StateBucket};

use kv::Json;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use tauri::Manager;

#[derive(Serialize, Deserialize, PartialEq, Clone, Default)]
pub struct ModelConfig {
  pub tokenizer: String,
  pub default_prompt_template: String,
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

  pub fn get(&self, path: &str) -> Result<ModelConfig, String> {
    let file_path = String::from(path);
    let bucket = self.0.lock();

    match bucket.get(&file_path) {
      Ok(Some(value)) => return Ok(value.0),
      Ok(None) => Ok(ModelConfig::default()),
      Err(e) => Err(format!("Error retrieving model type for {}: {}", path, e)),
    }
  }

  pub fn set(&self, path: &str, data: ModelConfig) -> Result<(), String> {
    let file_path = String::from(path);
    let bucket = self.0.lock();

    bucket
      .set(&file_path, &Json(data))
      .map_err(|e| format!("{}", e))?;

    bucket.flush().map_err(|e| format!("{}", e))?;

    Ok(())
  }
}

#[tauri::command]
pub fn get_model_config(
  state: tauri::State<'_, State>,
  path: &str,
) -> Result<ModelConfig, String> {
  state.get(path)
}

#[tauri::command]
pub async fn set_model_config(
  state: tauri::State<'_, State>,
  path: &str,
  config: ModelConfig,
) -> Result<(), String> {
  state.set(path, config)
}
