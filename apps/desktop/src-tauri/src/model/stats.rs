use crate::utils::kv_bucket::{self, StateBucket};

use kv::Json;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use tauri::Manager;

#[derive(Serialize, Deserialize, Default, PartialEq, Clone)]
pub struct ModelStats {
  #[serde(rename = "loadCount")]
  pub load_count: u64,
}

#[derive(Clone)]
pub struct State(pub StateBucket<Json<ModelStats>>);

impl State {
  pub fn new(app: &mut tauri::App) -> Result<(), String> {
    let bucket = kv_bucket::get_kv_bucket(
      app.app_handle(),
      String::from("model_stats"),
      String::from("v1"),
    )?;

    app.manage(State(Arc::new(Mutex::new(bucket))));
    Ok(())
  }

  pub fn increment_load_count(&self, path: &str) -> Result<(), String> {
    let current_value = self.get(path)?;
    let bucket = self.0.lock();
    let file_path = String::from(path);

    bucket
      .set(
        &file_path,
        &Json(ModelStats {
          load_count: current_value.load_count + 1,
        }),
      )
      .map_err(|e| format!("{}", e))?;

    bucket.flush().map_err(|e| format!("{}", e))?;
    Ok(())
  }

  pub fn get(&self, path: &str) -> Result<ModelStats, String> {
    let bucket = self.0.lock();

    let file_path = String::from(path);

    match bucket.get(&file_path) {
      Ok(Some(value)) => Ok(value.0),
      Ok(None) => Ok(Default::default()),
      Err(e) => {
        println!("Error retrieving model stats for {}: {}", path, e);
        return Ok(Default::default());
      }
    }
  }
}

#[tauri::command]
pub fn get_model_stats(
  state: tauri::State<'_, State>,
  path: &str,
) -> Result<ModelStats, String> {
  state.get(path)
}
