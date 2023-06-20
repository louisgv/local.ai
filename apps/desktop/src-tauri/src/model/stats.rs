#![allow(unused)]
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, PartialEq, Clone)]
pub struct ModelStats {
  #[serde(rename = "loadCount")]
  pub load_count: u64,
}

crate::macros::bucket_state::make!(ModelStats, "model_stats", "v1");
impl State {
  pub fn increment_load_count(&self, path: &str) -> Result<(), String> {
    let current_value = self.get(path)?;
    let bucket = self.0.lock();
    let file_path = String::from(path);

    bucket
      .set(
        &file_path,
        &kv::Json(ModelStats {
          load_count: current_value.load_count + 1,
        }),
      )
      .map_err(|e| format!("{}", e))?;

    bucket.flush().map_err(|e| format!("{}", e))?;
    Ok(())
  }
}
