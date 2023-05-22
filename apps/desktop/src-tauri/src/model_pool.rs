use once_cell::sync::Lazy;
use parking_lot::Mutex;

use std::sync::Arc;

use llm::load_progress_callback_stdout;

use std::path::Path;

use crate::inference_thread::ModelGuard;
use std::collections::VecDeque;

pub static LOADED_MODEL_POOL: Lazy<Mutex<VecDeque<Option<ModelGuard>>>> =
    Lazy::new(|| Mutex::new(VecDeque::new()));

pub fn is_empty() -> bool {
    let models = LOADED_MODEL_POOL.lock();
    models.is_empty()
}

pub fn get_model() -> Option<ModelGuard> {
    let mut models = LOADED_MODEL_POOL.lock();
    models.pop_front().flatten()
}

pub fn return_model(model: Option<ModelGuard>) {
    let mut models = LOADED_MODEL_POOL.lock();
    models.push_back(model);
}

pub fn spawn_pool(path: &str, model_type: &str, concurrency: usize) -> Result<(), String> {
    let now = std::time::Instant::now();
    let model_path = Path::new(path);

    let architecture = match model_type.parse() {
        Ok(architecture) => architecture,
        Err(_) => return Err(format!("Invalid model type: {model_type}")),
    };

    let mut models = VecDeque::with_capacity(concurrency);
    for _ in 0..concurrency {
        // ... load the model
        let model = match llm::load_dynamic(
            architecture,
            model_path,
            llm::ModelParameters {
                prefer_mmap: true,
                context_size: 8472,
                ..Default::default()
            },
            None,
            load_progress_callback_stdout,
        ) {
            Ok(model) => model,
            Err(err) => return Err(format!("Error loading model: {}", err)),
        };
        models.push_back(Some(Arc::new(Mutex::new(Some(model)))));
    }

    println!(
        "Model fully loaded! Elapsed: {}ms",
        now.elapsed().as_millis()
    );

    *LOADED_MODEL_POOL.lock() = models;

    Ok(())
}
