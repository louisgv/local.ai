#[cfg(any(target_os = "macos", target_os = "linux"))]
fn main() {
    tauri_build::build()
}

#[cfg(target_os = "windows")]
fn main() {
    let mut windows = tauri_build::WindowsAttributes::new();
    windows = windows.app_manifest(
        r#"
      <assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
      <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
          <security>
              <requestedPrivileges>
                  <requestedExecutionLevel level="requireAdministrator" uiAccess="false" />
              </requestedPrivileges>
          </security>
      </trustInfo>
      </assembly>
      "#,
    );

    tauri_build::try_build(tauri_build::Attributes::new().windows_attributes(windows))
        .expect("failed to run build script")
}
