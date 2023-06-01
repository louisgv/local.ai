use crate::kv_bucket::{self, StateBucket};

use parking_lot::Mutex;
use std::sync::Arc;

use tauri::Manager;

#[derive(Clone)]
pub struct State(StateBucket<String>);

impl State {
    pub fn new(app: &mut tauri::App) -> Result<(), String> {
        let bucket = kv_bucket::get_kv_bucket(
            app.app_handle(),
            String::from("model_type"),
            String::from("v1"),
        )?;

        app.manage(State(Arc::new(Mutex::new(bucket))));
        Ok(())
    }
}

#[tauri::command]
pub fn get_model_type(state: tauri::State<'_, State>, path: &str) -> Result<String, String> {
    let model_type_bucket = state.0.lock();

    let file_path = String::from(path);

    match model_type_bucket.get(&file_path) {
        Ok(Some(value)) => return Ok(value),
        Ok(None) => {
            println!("No cached model type for {}", path);
            return Err(format!("No cached model type for {}", path));
        }
        Err(e) => return Err(format!("Error retrieving model type for {}: {}", path, e)),
    }
}

#[tauri::command]
pub async fn set_model_type(
    state: tauri::State<'_, State>,
    path: &str,
    model_type: &str,
) -> Result<(), String> {
    let model_type_bucket = state.0.lock();

    let file_path = String::from(path);

    println!("Setting model type for {} to {}", path, model_type);

    model_type_bucket
        .set(&file_path, &String::from(model_type))
        .map_err(|e| format!("{}", e))?;

    model_type_bucket.flush().map_err(|e| format!("{}", e))?;

    Ok(())
}

pub async fn remove_model_type(state: tauri::State<'_, State>, path: &str) -> Result<(), String> {
    let model_type_bucket = state.0.lock();

    let file_path = String::from(path);

    model_type_bucket
        .remove(&file_path)
        .map_err(|e| format!("{}", e))?;

    Ok(())
}
