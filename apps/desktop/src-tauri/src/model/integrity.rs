use crate::utils::kv_bucket::{self, StateBucket};
use digest::Digest;
use kv::Json;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::path::Path;
use std::sync::Arc;
use tauri::{App, Manager};
use tokio::fs::File;
use tokio::io::{self, AsyncReadExt};

#[derive(Serialize, Deserialize, PartialEq, Clone)]
pub struct ModelIntegrity {
  pub sha256: String,
  pub blake3: String,
}

#[derive(Clone)]
pub struct State(pub StateBucket<Json<ModelIntegrity>>);

impl State {
  pub fn new(app: &mut App) -> Result<(), String> {
    let bucket = kv_bucket::get_kv_bucket(
      app.app_handle(),
      String::from("model_integrity"),
      String::from("v1"),
    )?;

    app.manage(State(Arc::new(Mutex::new(bucket))));
    Ok(())
  }
}

const BUFFER_SIZE: usize = 42 * 1024 * 1024; // 42 MiB buffer

pub async fn compute_file_integrity<P: AsRef<Path>>(
  path: P,
) -> Result<ModelIntegrity, io::Error> {
  let mut file = File::open(path).await?;
  let mut buffer = vec![0u8; BUFFER_SIZE];
  let mut hasher_sha256 = Sha256::new();
  let mut hasher_blake3 = blake3::Hasher::new();

  loop {
    let bytes_read = file.read(&mut buffer).await?;
    if bytes_read == 0 {
      break;
    }
    let chunk = &buffer[..bytes_read];
    hasher_sha256.update(chunk);
    hasher_blake3.update(chunk);
  }

  let hash_sha256 = hasher_sha256.finalize();
  let hash_blake3 = hasher_blake3.finalize();

  Ok(ModelIntegrity {
    sha256: format!("{:x}", hash_sha256),
    blake3: format!("{}", hash_blake3),
  })
}

#[tauri::command]
pub async fn get_cached_integrity(
  state: tauri::State<'_, self::State>,
  path: &str,
) -> Result<ModelIntegrity, String> {
  let state = state.0.lock();

  let file_path = String::from(path);

  match state.get(&file_path) {
    Ok(Some(value)) => return Ok(value.0),
    Ok(None) => return Err(format!("No cached hash for {}", path)),
    Err(e) => {
      return Err(format!("Error retrieving cached hash for {}: {}", path, e))
    }
  }
}

#[tauri::command]
pub async fn compute_model_integrity(
  state: tauri::State<'_, self::State>,
  path: &str,
) -> Result<ModelIntegrity, String> {
  let integrity = compute_file_integrity(path)
    .await
    .map_err(|e| format!("{}", e))?;

  let file_path = String::from(path);
  let model_integrity_bucket = state.0.lock();

  model_integrity_bucket
    .set(&file_path, &Json(integrity.clone()))
    .map_err(|e| format!("Error setting cached hash for {}: {}", path, e))?;

  model_integrity_bucket
    .flush()
    .map_err(|e| format!("{}", e))?;

  Ok(integrity)
}
