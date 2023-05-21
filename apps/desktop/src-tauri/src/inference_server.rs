use actix_web::dev::ServerHandle;
use actix_web::web::{Bytes, Json};

use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use once_cell::sync::Lazy;
use parking_lot::{Mutex, RwLock};
use std::collections::HashMap;

use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};

use llm::{load_progress_callback_stdout, Model};

use std::path::Path;

use crate::abort_stream::AbortStream;
use crate::inference_thread::{
    start_inference, CompletionRequest, InferenceThreadRequest, ModelGuard,
};

static LOADED_MODEL: Lazy<ModelGuard> = Lazy::new(|| Arc::new(RwLock::new(None)));

static _LOADED_MODELMAP: Lazy<Mutex<HashMap<String, Box<dyn Model>>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

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

#[get("/")]
async fn ping() -> impl Responder {
    HttpResponse::Ok().body("pong")
}

#[post("/completions")]
async fn post_completions(payload: Json<CompletionRequest>) -> impl Responder {
    println!("Received completion request: {:?}", payload.0);

    if !LOADED_MODEL.read().is_some() {
        println!("No model loaded.");
        return HttpResponse::InternalServerError().finish();
    }

    let (token_sender, receiver) = flume::unbounded::<Bytes>();

    let abort_flag = Arc::new(RwLock::new(false));

    let inference_thread = match start_inference(InferenceThreadRequest {
        model_guard: Arc::clone(&LOADED_MODEL),
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

    let stream = AbortStream::new(receiver, Arc::clone(&abort_flag), inference_thread);

    HttpResponse::Ok()
        .append_header(("Content-Type", "text/event-stream"))
        .append_header(("Cache-Control", "no-cache"))
        // .keep_alive()
        .streaming(stream)
}

#[tauri::command]
pub async fn start_server<'a>(
    state: tauri::State<'a, InferenceServerState>,
    port: u16,
) -> Result<(), String> {
    if state.running.load(Ordering::SeqCst) {
        return Err("Server is already running.".to_string());
    }

    state.running.store(true, Ordering::SeqCst);

    let server_clone = Arc::clone(&state.server);

    tauri::async_runtime::spawn(async move {
        let server = HttpServer::new(|| App::new().service(ping).service(post_completions))
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

#[tauri::command]
pub async fn load_model<'a>(path: &str, model_type: &str) -> Result<(), String> {
    let now = std::time::Instant::now();
    let model_path = Path::new(path);

    let architecture = match model_type.parse() {
        Ok(architecture) => architecture,
        Err(_) => return Err(format!("Invalid model type: {model_type}")),
    };

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

    println!(
        "Model fully loaded! Elapsed: {}ms",
        now.elapsed().as_millis()
    );

    *LOADED_MODEL.write() = Some(model);

    // let mut modelmap = LOADED_MODELMAP.lock();
    // modelmap.insert(name.to_string(), model);

    Ok(())
}
