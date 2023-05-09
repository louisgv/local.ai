use crate::kv_bucket;
use md5::Context;
use once_cell::sync::Lazy;
use std::fs::File;
use std::io::{self, Read};
use std::path::Path;
use std::sync::Mutex;
use tauri::AppHandle;

static BUCKET_LOCK: Lazy<Mutex<()>> = Lazy::new(|| Mutex::new(()));

// Key is absolute file path in the file system
pub fn get_model_checksum_bucket(app_handle: &AppHandle) -> kv::Bucket<'_, String, String> {
    let _guard = BUCKET_LOCK.lock().unwrap();

    kv_bucket::get_kv_bucket(
        app_handle,
        String::from("data"),
        String::from("model_checksum"),
    )
    .unwrap()
}

const BUFFER_SIZE: usize = 42 * 1024 * 1024; // 42 MiB buffer

fn read_chunk(file: &mut File, buffer: &mut [u8]) -> io::Result<usize> {
    file.read(buffer)
}

pub fn calculate_md5<P: AsRef<Path>>(path: P) -> Result<String, io::Error> {
    let mut file = File::open(path)?;
    let mut buffer = vec![0u8; BUFFER_SIZE];
    let mut context = Context::new();

    loop {
        let bytes_read = file.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        context.consume(&buffer[..bytes_read]);
    }

    let result = context.compute();
    Ok(format!("{:x}", result))
}

#[tauri::command]
pub async fn get_cached_hash(app_handle: AppHandle, path: &str) -> Result<String, String> {
    let model_checksum_bucket = get_model_checksum_bucket(&app_handle);

    let file_path = String::from(path);

    match model_checksum_bucket.get(&file_path) {
        Ok(Some(value)) => return Ok(value),
        Ok(None) => return Err(format!("No cached hash for {}", path)),
        Err(e) => return Err(format!("Error retrieving cached hash for {}: {}", path, e)),
    }
}

#[tauri::command]
pub async fn get_hash(app_handle: AppHandle, path: &str) -> Result<String, String> {
    let hash = match calculate_md5(&path) {
        Ok(md5_hash) => md5_hash,
        Err(e) => return Err(format!("Error calculating MD5 for {}: {}", path, e)),
    };

    let model_checksum_bucket = get_model_checksum_bucket(&app_handle);

    let file_path = String::from(path);

    model_checksum_bucket.set(&file_path, &hash);

    Ok(hash)
}
