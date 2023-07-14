use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct ServerConfig {
  #[serde(rename = "useGpu")]
  pub use_gpu: Option<bool>,

  pub port: Option<u16>,

  pub concurrency: Option<usize>,
}

crate::macros::bucket_state::make!(ServerConfig, "server_config", "v1");
