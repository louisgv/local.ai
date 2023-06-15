#[tauri::command]
pub fn open_directory(path: String) {
  #[cfg(target_os = "windows")]
  {
    use std::process::Command;

    Command::new("explorer")
      .args(["/select,", &path]) // The comma after select is not a typo
      .spawn()
      .unwrap();
  }

  #[cfg(target_os = "linux")]
  {
    use std::process::Command;

    Command::new("xdg-open").arg(&path).spawn().unwrap();
  }

  #[cfg(target_os = "macos")]
  {
    use std::process::Command;
    Command::new("open").args(["-R", &path]).spawn().unwrap();
  }
}
