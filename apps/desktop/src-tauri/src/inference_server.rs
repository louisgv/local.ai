use actix_cors::Cors;
use actix_web::dev::ServerHandle;
use actix_web::web::{Bytes, Json};

use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use once_cell::sync::Lazy;
use parking_lot::{Mutex, RwLock};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use tauri::AppHandle;

use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc,
};

use crate::abort_stream::AbortStream;
use crate::config::ConfigKey;
use crate::inference_thread::{
  start_inference, CompletionRequest, InferenceThreadRequest,
};
use crate::model_pool::{self, spawn_pool};
use crate::model_stats;
use crate::path::get_app_dir_path_buf;
use llm::{Model, VocabularySource};

static _LOADED_MODELMAP: Lazy<Mutex<HashMap<String, Box<dyn Model>>>> =
  Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(Default)]
pub struct State {
  server: Arc<Mutex<Option<ServerHandle>>>,
  running: AtomicBool,
}

#[get("/")]
async fn ping() -> impl Responder {
  HttpResponse::Ok().body("pong")
}

#[derive(Serialize)]
struct ModelInfo {
  id: String,
}

#[post("/model")]
async fn post_model() -> impl Responder {
  HttpResponse::Ok().json(ModelInfo {
    id: String::from("local.ai"),
  })
}

#[post("/completions")]
async fn post_completions(payload: Json<CompletionRequest>) -> impl Responder {
  println!("Received completion request: {:?}", payload.0);

  if model_pool::is_empty() {
    println!("No model loaded or available in the pool.");
    return HttpResponse::ServiceUnavailable().finish();
  }

  let (token_sender, receiver) = flume::unbounded::<Bytes>();

  let model_guard = match model_pool::get_model() {
    Some(guard) => guard,
    None => {
      println!("No model available.");
      return HttpResponse::ServiceUnavailable().finish();
    }
  };

  let abort_flag = Arc::new(RwLock::new(false));

  let inference_thread = match start_inference(InferenceThreadRequest {
    model_guard: Arc::clone(&model_guard),
    abort_flag: Arc::clone(&abort_flag),
    token_sender,
    completion_request: payload.0,
  }) {
    Some(thread) => thread,
    None => {
      println!("Failed to spawn inference thread.");
      return HttpResponse::InternalServerError().finish();
    }
  };

  let stream =
    AbortStream::new(receiver, Arc::clone(&abort_flag), inference_thread);

  HttpResponse::Ok()
    .append_header(("Content-Type", "text/event-stream"))
    .append_header(("Cache-Control", "no-cache"))
    // .keep_alive()
    .streaming(stream)
}

#[tauri::command]
pub async fn start_server<'a>(
  state: tauri::State<'a, State>,
  port: u16,
) -> Result<(), String> {
  if state.running.load(Ordering::SeqCst) {
    return Err("Server is already running.".to_string());
  }

  state.running.store(true, Ordering::SeqCst);

  let server_clone = Arc::clone(&state.server);

  tauri::async_runtime::spawn(async move {
    let server = HttpServer::new(|| {
      let cors = Cors::permissive();
      App::new()
        .wrap(cors)
        .service(ping)
        .service(post_model)
        .service(post_completions)
    })
    .bind(("127.0.0.1", port))
    .unwrap()
    // .disable_signals()
    .run();
    *server_clone.lock() = Some(server.handle());
    println!("Server started on port {port}");
    server.await.unwrap();
  });

  Ok(())
}

#[tauri::command]
pub async fn stop_server<'a>(
  state: tauri::State<'a, State>,
) -> Result<(), String> {
  println!("Stopping server on port");

  if !state.running.load(Ordering::SeqCst) {
    return Err("Server is not running.".to_string());
  }

  let server_stop = {
    let mut server_opt = state.server.lock();
    if let Some(server) = server_opt.take() {
      state.running.store(false, Ordering::SeqCst);
      Some(server.stop(true))
    } else {
      None
    }
  };

  if let Some(server_stop) = server_stop {
    server_stop.await;
  } else {
    return Err("Server is not running.".to_string());
  }

  Ok(())
}

#[derive(Serialize, Deserialize)]
pub struct ModelVocabulary {
  /// Local path to vocabulary
  pub vocabulary_path: Option<PathBuf>,

  /// Remote HuggingFace repository containing vocabulary
  pub vocabulary_repository: Option<String>,
}
impl ModelVocabulary {
  pub fn to_source(&self) -> VocabularySource {
    match (&self.vocabulary_path, &self.vocabulary_repository) {
      (Some(path), None) => {
        VocabularySource::HuggingFaceTokenizerFile(path.to_owned())
      }
      (None, Some(repo)) => {
        VocabularySource::HuggingFaceRemote(repo.to_owned())
      }
      (_, _) => VocabularySource::Model,
    }
  }
}

#[tauri::command]
pub async fn load_model<'a>(
  model_stats_bucket_state: tauri::State<'_, model_stats::State>,
  config_state: tauri::State<'_, crate::config::State>,
  app_handle: AppHandle,
  path: &str,
  model_type: &str,
  model_vocabulary: ModelVocabulary,
  concurrency: usize,
) -> Result<(), String> {
  config_state.set(ConfigKey::OnboardState, format!("done"))?;
  model_stats::increment_load_count(model_stats_bucket_state, path)?;

  let cache_dir =
    get_app_dir_path_buf(app_handle, String::from("inference_cache"))?;

  spawn_pool(
    path,
    model_type,
    &model_vocabulary.to_source(),
    concurrency,
    &cache_dir,
  )
  .await
}
