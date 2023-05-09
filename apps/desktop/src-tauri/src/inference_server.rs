use actix_web::dev::ServerHandle;
use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use parking_lot::Mutex;
use serde::Deserialize;

use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};

pub struct InferenceServerState {
    server: Arc<Mutex<Option<ServerHandle>>>,
    running: AtomicBool,
}

impl Default for InferenceServerState {
    fn default() -> Self {
        Self {
            server: Arc::new(Mutex::new(None)),
            running: AtomicBool::new(false),
        }
    }
}

#[derive(Deserialize)]
struct CompletionRequest {
    model: String,
    prompt: String,
    max_tokens: u32,
    temperature: f64,
    stop: Option<String>,
    stream: bool,
}

#[get("/ping")]
async fn ping() -> impl Responder {
    // Implement your completion logic here
    // For example, you can use the `CompletionRequest` struct to generate completions
    // and return them as an HTTP response

    // For now, return a simple "Hello, World!" response
    HttpResponse::Ok().body("pong")
}

#[post("/completions")]
async fn post_completions() -> impl Responder {
    // Implement your completion logic here
    // For example, you can use the `CompletionRequest` struct to generate completions
    // and return them as an HTTP response

    // For now, return a simple "Hello, World!" response
    HttpResponse::Ok().body("Hello, World!")
}

#[tauri::command]
pub async fn start_server<'a>(
    state: tauri::State<'a, InferenceServerState>,
    port: u16,
) -> Result<(), String> {
    println!("Starting server on port {}", port);

    if state.running.load(Ordering::SeqCst) {
        return Err("Server is already running.".to_string());
    }

    let server = HttpServer::new(|| App::new().service(ping).service(post_completions))
        .bind(("127.0.0.1", port))
        .unwrap()
        .disable_signals()
        .run();

    state.running.store(true, Ordering::SeqCst);
    *state.server.lock() = Some(server.handle());

    server.await.unwrap();

    Ok(())
}

#[tauri::command]
pub async fn stop_server<'a>(state: tauri::State<'a, InferenceServerState>) -> Result<(), String> {
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
