#[tauri::command]
pub fn open_directory(path: String) -> Result<(), String> {
  #[cfg(target_os = "windows")]
  {
    use std::process::Command;

    Command::new("explorer")
      .args(["/select,", &path]) // The comma after select is not a typo
      .spawn()
      .map_err(|e| format!("Error opening directory: {}", e))?;
  }

  #[cfg(target_os = "linux")]
  {
    use std::fs::metadata;
    use std::path::PathBuf;
    use std::process::Command;

    let path_metadata = metadata(&path).map_err(|e| format!("{}", e))?;

    let dir_path = match path_metadata.is_dir() {
      true => path,
      false => {
        let mut tmp_path = PathBuf::from(path);
        tmp_path.pop();

        tmp_path
          .into_os_string()
          .into_string()
          .map_err(|e| format!("{:?}", e))?
      }
    };

    Command::new("xdg-open")
      .arg(&dir_path)
      .spawn()
      .map_err(|e| format!("Error opening directory: {}", e))?;
  }

  #[cfg(target_os = "macos")]
  {
    use std::process::Command;
    Command::new("open")
      .args(["-R", &path])
      .spawn()
      .map_err(|e| format!("Error opening directory: {}", e))?;
  }

  Ok(())
}
