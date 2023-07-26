use actix_cors::Cors;
use actix_web::dev::ServerHandle;
use actix_web::web::{Bytes, Json};
use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use parking_lot::{Mutex, RwLock};
use serde::Serialize;
use serde_json::json;

use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc,
};

use crate::inference::completion::CompletionRequest;
use crate::inference::process::{start, InferenceThreadRequest};
use crate::model;
use crate::utils::abort_stream::AbortStream;

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

  if model::pool::is_empty() {
    println!("No model loaded or available in the pool.");
    return HttpResponse::ServiceUnavailable().finish();
  }

  let model_guard = match model::pool::get_model() {
    Some(guard) => guard,
    None => {
      println!("No model available.");
      return HttpResponse::ServiceUnavailable().finish();
    }
  };

  let (token_sender, receiver) = flume::unbounded::<Bytes>();

  if let Some(true) = payload.stream {
    HttpResponse::Ok()
      .append_header(("Content-Type", "text/event-stream"))
      .append_header(("Cache-Control", "no-cache"))
      .keep_alive()
      .streaming({
        let abort_flag = Arc::new(RwLock::new(false));
        let str_buffer = Arc::new(Mutex::new(String::new()));

        AbortStream::new(
          receiver,
          abort_flag.clone(),
          start(InferenceThreadRequest {
            model_guard: model_guard.clone(),
            abort_flag: abort_flag.clone(),
            token_sender,
            completion_request: payload.0,
            nonstream_completion_tokens: str_buffer.clone(),
            stream: true,
            tx: None,
          }),
        )
      })
  } else {
    let abort_flag = Arc::new(RwLock::new(false));
    let completion_tokens = Arc::new(Mutex::new(String::new()));
    let (tx, rx) = flume::unbounded::<()>();
    start(InferenceThreadRequest {
      model_guard: model_guard.clone(),
      abort_flag: abort_flag.clone(),
      token_sender,
      completion_request: payload.0,
      nonstream_completion_tokens: completion_tokens.clone(),
      stream: false,
      tx: Some(tx),
    });

    rx.recv().unwrap();

    let locked_str_buffer = completion_tokens.lock();
    let completion_body = json!({
      "completion": locked_str_buffer.clone()
    });

    HttpResponse::Ok()
      .append_header(("Content-Type", "text/plain"))
      .append_header(("Cache-Control", "no-cache"))
      .json(completion_body)
  }
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

  tauri::async_runtime::spawn({
    let server_arc = state.server.clone();
    async move {
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
      // .bind(("0.0.0.0", port)) // TODO: make a toggle for this
      // .unwrap()
      // .disable_signals()
      .run();
      *server_arc.lock() = Some(server.handle());
      println!("Server started on port {port}");
      server.await.unwrap();
    }
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
