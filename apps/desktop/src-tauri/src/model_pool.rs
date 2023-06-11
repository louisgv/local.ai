use once_cell::sync::Lazy;
use parking_lot::Mutex;

use std::{fs, path::PathBuf, sync::Arc};

use llm::{load_progress_callback_stdout, ModelArchitecture, VocabularySource};

use std::path::Path;

use crate::inference_thread::ModelGuard;
use std::collections::VecDeque;

pub static LOADED_MODEL_POOL: Lazy<Mutex<VecDeque<Option<ModelGuard>>>> =
  Lazy::new(|| Mutex::new(VecDeque::new()));

pub static CONCURRENCY_COUNT: Lazy<Mutex<usize>> = Lazy::new(|| Mutex::new(0));

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

pub fn get_n_threads() -> usize {
  num_cpus::get_physical() / (*CONCURRENCY_COUNT.lock())
}

pub async fn spawn_pool(
  path: &str,
  model_type: &str,
  vocabulary_source: &VocabularySource,
  concurrency: usize,
  cache_dir: &PathBuf,
) -> Result<(), String> {
  let now = std::time::Instant::now();
  let model_path = Path::new(path);

  let architecture: ModelArchitecture = model_type
    .parse()
    .map_err(|_| format!("Invalid model type: {model_type}"))?;

  let skip_copy = concurrency == 1;
  let mut tasks = vec![];
  let original_model_path = model_path.to_path_buf();

  *CONCURRENCY_COUNT.lock() = concurrency;

  for i in 0..concurrency {
    let cache_name = format!("run_cache_{}", i);
    let cache_file_path = cache_dir.join(cache_name);
    let original_model_path = original_model_path.clone();
    let architecture = architecture.clone();
    let vocabulary_source = vocabulary_source.to_owned();
    let task = tokio::task::spawn_blocking(move || {
      if !skip_copy {
        fs::copy(&original_model_path, &cache_file_path)
          .map_err(|_| "Failed to copy file".to_string())?;
      }

      let cache_path = if skip_copy {
        original_model_path
      } else {
        cache_file_path
      };

      match llm::load_dynamic(
        architecture,
        cache_path.as_path(),
        vocabulary_source.clone(),
        llm::ModelParameters {
          prefer_mmap: true,
          // TODO: need to figure out how to assign this properly, and automatically
          // context_size: 8472,
          ..Default::default()
        },
        load_progress_callback_stdout,
      ) {
        Ok(model) => Ok(Arc::new(Mutex::new(Some(model)))),
        Err(e) => Err(format!("Failed to load model: {}", e)),
      }
    });

    tasks.push(task);
  }

  let task_results = futures::future::join_all(tasks).await;

  let models: Result<Vec<_>, _> = task_results
    .into_iter()
    .map(|res| {
      res
        .map_err(|e| format!("{}", e))
        .and_then(|inner| inner.map(Some))
    })
    .collect();

  let models = models?;

  println!(
    "Model fully loaded! Elapsed: {}ms",
    now.elapsed().as_millis()
  );

  *LOADED_MODEL_POOL.lock() = VecDeque::from(models);

  Ok(())
}
