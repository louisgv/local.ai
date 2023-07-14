macro_rules! make {
  ($state_type:ident, $bucket_name:expr, $bucket_version:expr) => {
    #[derive(Clone)]
    pub struct State(
      pub crate::utils::kv_bucket::StateBucket<kv::Json<$state_type>>,
      tauri::AppHandle,
    );

    impl State {
      pub fn new(app: &mut tauri::App) -> Result<(), String> {
        use tauri::Manager;
        let bucket = crate::utils::kv_bucket::get_kv_bucket(
          app.app_handle(),
          String::from($bucket_name),
          String::from($bucket_version),
        )?;

        app.manage(State(
          std::sync::Arc::new(parking_lot::Mutex::new(bucket)),
          app.app_handle(),
        ));
        Ok(())
      }

      pub fn get(&self, path: &str) -> Result<$state_type, String> {
        let file_path = String::from(path);
        let bucket = self.0.lock();

        match bucket.get(&file_path) {
          Ok(Some(value)) => Ok(value.0),
          Ok(None) => Err(format!("No data for {} at {}", $bucket_name, path)),
          Err(e) => Err(format!(
            "Error retrieving {} for {}: {}",
            $bucket_name, path, e
          )),
        }
      }

      pub fn set(&self, path: &str, data: $state_type) -> Result<(), String> {
        let file_path = String::from(path);
        let bucket = self.0.lock();

        bucket
          .set(&file_path, &kv::Json(data))
          .map_err(|e| format!("{}", e))?;

        bucket.flush().map_err(|e| format!("{}", e))?;

        Ok(())
      }
    }

    paste::paste! {
      #[tauri::command]
      pub fn [<get_ $bucket_name>](
        state: tauri::State<'_, State>,
        path: &str,
      ) -> Result<$state_type, String> {
        state.get(path)
      }
      #[tauri::command]
      pub async fn [<set_ $bucket_name>](
        state: tauri::State<'_, State>,
        path: &str,
        config: $state_type,
      ) -> Result<(), String> {
        state.set(path, config)
      }
    }
  };
}

pub(crate) use make;
