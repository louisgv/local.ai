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
    use std::path::{Path, PathBuf};
    use std::fs::metadata;

      let new_path = match metadata(&path).unwrap().is_dir() {
        true => path,
        false => {
          let mut path2 = PathBuf::from(path);
          path2.pop();
          path2.into_os_string().into_string().unwrap()
        }
      };

    Command::new("xdg-open")
      .arg(&new_path)
      .spawn()
      .unwrap();
  }

  #[cfg(target_os = "macos")]
  {
    use std::process::Command;
    Command::new("open").args(["-R", &path]).spawn().unwrap();
  }
}
