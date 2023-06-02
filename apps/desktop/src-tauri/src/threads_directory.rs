use crate::{
    config::ConfigKey,
    path::{DirectoryState, FileInfo},
};

// Move this to a state
pub fn get_current_threads_path(
    default_path_state: tauri::State<'_, crate::path::State>,
    config_bucket_state: tauri::State<'_, crate::config::State>,
) -> Result<String, String> {
    let default_models_path_buf = &default_path_state.threads_directory_buf;
    Ok(config_bucket_state
        .get(ConfigKey::ThreadsDirectory)
        .unwrap_or(default_models_path_buf.display().to_string()))
}

fn sort_files(files: &mut Vec<FileInfo>) {
    files.sort_unstable_by(|a, b| b.modified.cmp(&a.modified));
}

#[tauri::command]
pub async fn initialize_threads_dir(
    default_path_state: tauri::State<'_, crate::path::State>,
    config_bucket_state: tauri::State<'_, crate::config::State>,
) -> Result<DirectoryState, String> {
    let threads_path = get_current_threads_path(default_path_state, config_bucket_state)?;

    let mut files = crate::path::read_directory(threads_path.as_str()).await?;

    sort_files(&mut files);

    Ok(DirectoryState {
        path: threads_path,
        files,
    })
}

#[tauri::command]
pub async fn update_threads_dir(
    dir: &str,
    config_bucket_state: tauri::State<'_, crate::config::State>,
) -> Result<DirectoryState, String> {
    config_bucket_state
        .set(ConfigKey::ThreadsDirectory, dir.to_string())
        .map_err(|e| format!("Error setting models path: {}", e))?;

    let mut files = crate::path::read_directory(dir).await?;

    sort_files(&mut files);

    Ok(DirectoryState {
        path: String::from(dir),
        files,
    })
}

#[tauri::command]
pub async fn delete_thread_file(path: &str) -> Result<(), String> {
    tokio::try_join!(async {
        tokio::fs::remove_file(&path)
            .await
            .map_err(|e| format!("{}", e))
    },)?;

    Ok(())
}
