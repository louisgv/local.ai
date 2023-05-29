use once_cell::sync::Lazy;
use parking_lot::Mutex;

use std::{path::PathBuf, sync::Arc};

use llm::{
    load_progress_callback_stdout, InferenceParameters, ModelArchitecture, VocabularySource,
};

use std::path::Path;

use crate::inference_thread::ModelGuard;
use std::collections::VecDeque;

pub static LOADED_MODEL_POOL: Lazy<Mutex<VecDeque<Option<ModelGuard>>>> =
    Lazy::new(|| Mutex::new(VecDeque::new()));

pub static THREAD_PER_INSTANCE: Lazy<Mutex<usize>> = Lazy::new(|| Mutex::new(0));

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

pub fn get_inference_params() -> InferenceParameters {
    InferenceParameters {
        // n_batch: 4,
        n_threads: *THREAD_PER_INSTANCE.lock(),
        ..Default::default()
    }
}

pub async fn spawn_pool(
    path: &str,
    model_type: &str,
    concurrency: usize,
    cache_dir: &PathBuf,
) -> Result<(), String> {
    let now = std::time::Instant::now();
    let model_path = Path::new(path);

    let architecture: ModelArchitecture = match model_type.parse() {
        Ok(architecture) => architecture,
        Err(_) => return Err(format!("Invalid model type: {model_type}")),
    };

    let skip_copy = concurrency == 1;
    let mut tasks = vec![];
    let original_model_path = model_path.to_path_buf();

    *THREAD_PER_INSTANCE.lock() = num_cpus::get_physical() / concurrency;

    for i in 0..concurrency {
        let cache_name = format!("run_cache_{}", i);
        let cache_file_path = cache_dir.join(cache_name);
        let original_model_path = original_model_path.clone();
        let architecture = architecture.clone();

        // Create a new task for each copy operation
        let task = tokio::spawn(async move {
            // Copy the file if necessary
            if !skip_copy {
                tokio::fs::copy(&original_model_path, &cache_file_path)
                    .await
                    .expect("Failed to copy file");
            }

            let cache_path = if skip_copy {
                original_model_path
            } else {
                cache_file_path
            };

            let model = match llm::load_dynamic(
                architecture,
                cache_path.as_path(),
                VocabularySource::HuggingFaceRemote(String::from("JosephusCheung/Guanaco")),
                llm::ModelParameters {
                    prefer_mmap: true,
                    context_size: 8472,

                    ..Default::default()
                },
                None,
                load_progress_callback_stdout,
            ) {
                Ok(model) => Some(Arc::new(Mutex::new(Some(model)))),
                Err(err) => {
                    println!("Failed to load model: {}", err);
                    None
                }
            };

            model
        });

        tasks.push(task);
    }

    // Wait for all tasks to complete and collect the results
    let models: Result<Vec<_>, _> = futures::future::join_all(tasks).await.into_iter().collect();

    let models = match models {
        Ok(models) => models,
        Err(_) => {
            return Err("Failed to load model".to_string());
        }
    };

    println!(
        "Model fully loaded! Elapsed: {}ms",
        now.elapsed().as_millis()
    );

    *LOADED_MODEL_POOL.lock() = VecDeque::from(models);

    Ok(())
}
