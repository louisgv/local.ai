use std::fs::File;
use std::io::{BufReader, Read};
use std::path::Path;

use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;

#[derive(Serialize, Deserialize)]
pub struct FileInfo {
    md5: String,
    size: u64,
    name: String,
}

const BUFFER_SIZE: usize = 8 * 1024; // 8 KiB buffer

fn calculate_md5<P: AsRef<Path>>(path: P) -> Result<String, std::io::Error> {
    println!("calculate_md5: {:?}", path.as_ref());
    let file = File::open(path)?;
    let mut reader = BufReader::new(file);
    let mut buffer = [0; BUFFER_SIZE];
    let mut hasher = md5::Context::new();

    loop {
        let bytes_read = reader.read(&mut buffer)?;
        println!("bytes_read: {}", bytes_read);
        if bytes_read == 0 {
            break;
        }
        hasher.consume(&buffer[..bytes_read]);
    }

    let digest = hasher.compute();
    println!("digest: {:?}", digest);
    Ok(format!("{:x}", digest))
}

fn process_directory(dir: &str) -> Vec<FileInfo> {
    let walker = WalkDir::new(dir).into_iter();

    walker
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file())
        .par_bridge()
        .map(|entry| {
            let path = entry.path().to_path_buf();
            let file_name = entry.path().display().to_string();
            let file_size = entry.metadata().unwrap().len();

            match calculate_md5(&path) {
                Ok(md5_hash) => Some(FileInfo {
                    md5: md5_hash,
                    size: file_size,
                    name: file_name,
                }),
                Err(e) => {
                    eprintln!("Error calculating MD5 for {}: {}", file_name, e);
                    None
                }
            }
        })
        .filter_map(|x| x)
        .collect()
}

#[tauri::command]
pub async fn get_hash(path: &str) -> Result<FileInfo, String> {
    let file_path = Path::new(path);
    let file_name = file_path.display().to_string();
    let file_size = file_path
        .metadata()
        .map_err(|e| format!("Error getting metadata for {}: {}", file_name, e))?
        .len();

    match calculate_md5(&path) {
        Ok(md5_hash) => Ok(FileInfo {
            md5: md5_hash,
            size: file_size,
            name: file_name,
        }),
        Err(e) => Err(format!("Error calculating MD5 for {}: {}", file_name, e)),
    }
}
