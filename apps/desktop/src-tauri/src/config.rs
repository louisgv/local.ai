use crate::utils::kv_bucket::{self, StateBucket};
use core::fmt;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::Manager;

#[derive(Clone, Copy, Serialize, Deserialize, Debug)]
pub enum ConfigKey {
  #[serde(rename = "models_directory")]
  ModelsDirectory,
  #[serde(rename = "threads_directory")]
  ThreadsDirectory,
  #[serde(rename = "onboard_state")]
  OnboardState,
}

impl fmt::Display for ConfigKey {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      ConfigKey::ModelsDirectory => write!(f, "models_directory"),
      ConfigKey::ThreadsDirectory => write!(f, "threads_directory"),
      ConfigKey::OnboardState => write!(f, "onboard_state"),
    }
  }
}

#[derive(Clone)]
pub struct State(pub StateBucket<String>);

impl State {
  pub fn new(app: &mut tauri::App) -> Result<(), String> {
    let bucket = kv_bucket::get_kv_bucket(
      app.app_handle(),
      String::from("config"),
      String::from("v1"),
    )?;

    app.manage(State(Arc::new(Mutex::new(bucket))));
    Ok(())
  }

  pub fn set(
    &self,
    config_key: ConfigKey,
    value: String,
  ) -> Result<bool, String> {
    if value.is_empty() {
      return Err(format!("Empty value"));
    }

    let bucket = self.0.lock();

    bucket
      .set(&config_key.to_string(), &value)
      .map(|_| true)
      .map_err(|e| format!("Error setting {}: {}", config_key, e))?;
    bucket.flush().map_err(|e| e.to_string())?;
    Ok(true)
  }

  pub fn get(&self, config_key: ConfigKey) -> Result<String, String> {
    let bucket = self.0.lock();

    bucket
      .get(&config_key.to_string())
      .map_err(|e| format!("Error config: {}", e))
      .and_then(|opt| opt.ok_or_else(|| format!("Error getting config")))
  }
}

#[tauri::command]
pub async fn get_config(
  state: tauri::State<'_, State>,
  key: ConfigKey,
) -> Result<String, String> {
  state.get(key)
}
