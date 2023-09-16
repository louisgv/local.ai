use serde::{Deserialize, Serialize};

use strum::Display;

use crate::path::get_app_dir_path_buf;

#[derive(Display)]
#[strum(serialize_all = "snake_case")]
pub enum ConfigKey {
  ModelsDirectory,
  ThreadsDirectory,
  OnboardState,
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct ConfigValue {
  pub data: Option<String>,
}

crate::macros::bucket_state::make!(ConfigValue, "config", "v2");

impl State {
  fn make_default_directory_string(
    &self,
    sub_path: &str,
  ) -> Result<String, String> {
    Ok({
      get_app_dir_path_buf(self.1.clone(), sub_path)?
        .display()
        .to_string()
    })
  }
  pub fn read(&self, key: ConfigKey) -> Result<String, String> {
    match self.get(&key.to_string()) {
      Ok(val) => Ok(val.data.unwrap_or_else(|| self.default_for_key(&key))),
      Err(_) => Ok(self.default_for_key(&key)),
    }
  }

  fn default_for_key(&self, key: &ConfigKey) -> String {
    match key {
      ConfigKey::ModelsDirectory => self
        .make_default_directory_string("models")
        .unwrap_or_default(),
      ConfigKey::ThreadsDirectory => self
        .make_default_directory_string("threads")
        .unwrap_or_default(),
      _ => "".to_string(),
    }
  }

  pub fn write(&self, key: ConfigKey, data: &str) -> Result<(), String> {
    self.set(
      &key.to_string(),
      ConfigValue {
        data: Some(data.to_string()),
      },
    )
  }
}
