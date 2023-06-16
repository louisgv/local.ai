use crate::kv_bucket::{self, StateBucket};

use parking_lot::Mutex;
use std::sync::Arc;

use tauri::Manager;

#[derive(Clone)]
pub struct State(pub StateBucket<String>);

impl State {
  pub fn new(app: &mut tauri::App) -> Result<(), String> {
    let bucket = kv_bucket::get_kv_bucket(
      app.app_handle(),
      String::from("model_type"),
      String::from("v1"),
    )?;

    app.manage(State(Arc::new(Mutex::new(bucket))));
    Ok(())
  }

  pub fn get(&self, path: &str) -> Result<String, String> {
    let bucket = self.0.lock();

    let file_path = String::from(path);

    match bucket.get(&file_path) {
      Ok(Some(value)) => Ok(value),
      _ => Ok("llama".to_string()),
    }
  }

  pub fn set(&self, path: &str, model_type: &str) -> Result<(), String> {
    let model_type_bucket = self.0.lock();

    let file_path = String::from(path);

    model_type_bucket
      .set(&file_path, &String::from(model_type))
      .map_err(|e| format!("{}", e))?;

    model_type_bucket.flush().map_err(|e| format!("{}", e))?;

    Ok(())
  }
}

#[tauri::command]
pub fn get_model_type(
  state: tauri::State<'_, State>,
  path: &str,
) -> Result<String, String> {
  state.get(path)
}

#[tauri::command]
pub async fn set_model_type(
  state: tauri::State<'_, State>,
  path: &str,
  model_type: &str,
) -> Result<(), String> {
  state.set(path, model_type)
}
