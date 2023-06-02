use crate::kv_bucket::{self, StateBucket};
use core::fmt;
use parking_lot::Mutex;
use std::{path::Path, sync::Arc};
use tauri::Manager;

#[derive(Clone, Copy)]
pub enum ConfigKey {
    ModelsDirectory,
    ThreadsDirectory,
}
impl fmt::Display for ConfigKey {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ConfigKey::ModelsDirectory => write!(f, "models_directory"),
            ConfigKey::ThreadsDirectory => write!(f, "threads_directory"),
        }
    }
}

#[derive(Clone)]
pub struct State(pub StateBucket<String>);

impl State {
    pub fn new(app: &mut tauri::App) -> Result<(), String> {
        let bucket =
            kv_bucket::get_kv_bucket(app.app_handle(), String::from("config"), String::from("v1"))?;

        app.manage(State(Arc::new(Mutex::new(bucket))));
        Ok(())
    }

    pub fn set(&self, config_key: ConfigKey, value: String) -> Result<bool, String> {
        // Check if abs_path is not empty and is an absolute path
        if value.is_empty() || !Path::new(&value).is_absolute() {
            return Ok(false);
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
            .map_err(|e| format!("Error getting models path: {}", e))
            .and_then(|opt| opt.ok_or_else(|| format!("Error getting models path")))
    }
}
