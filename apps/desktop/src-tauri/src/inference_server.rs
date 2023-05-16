use actix_web::dev::ServerHandle;
use actix_web::web::{Bytes, Json};

use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use flume::Sender;
use llm::{InferenceFeedback, InferenceParameters, InferenceResponse};
use once_cell::sync::Lazy;
use parking_lot::{Mutex, RwLock};
use rand::SeedableRng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::io::AsyncWriteExt;
use tokio_util::codec::{BytesCodec, FramedRead};

use futures::StreamExt;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};

use llm::{load_progress_callback_stdout, InferenceRequest, Model};

use std::{convert::Infallible, path::Path};

use crate::abort_stream::AbortStream;
use crate::inference_thread::{
    initialize_inference_thread, CompletionRequest, InferenceThreadRequest,
};

static _LOADED_MODELMAP: Lazy<Mutex<HashMap<String, Box<dyn Model>>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

static INFERENCE_THREAD_TX: Lazy<Arc<RwLock<Option<Sender<InferenceThreadRequest>>>>> =
    Lazy::new(|| Arc::new(RwLock::new(None)));

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
    let (tx, rx) = flume::unbounded::<Bytes>();

    let (mut to_write, to_read) = tokio::io::duplex(1024 * 1024);

    let abort_flag = Arc::new(RwLock::new(false));
    let abort_flag_clone = Arc::clone(&abort_flag);

    tauri::async_runtime::spawn(async move {
        while let Ok(data) = rx.recv_async().await {
            to_write.write_all(&data).await.unwrap();
        }
    });

    let stream = AbortStream {
        inner: FramedRead::new(to_read, BytesCodec::new()).map(|res| match res {
            Ok(bytes) => Ok(bytes.into()),
            Err(e) => Err(e.into()),
        }),
        abort_flag: abort_flag_clone,
    };

    let guard = INFERENCE_THREAD_TX.read();
    let sender = guard.as_ref().unwrap().clone();

    match sender.send(InferenceThreadRequest {
        tx_token: tx,
        abort_token: abort_flag,
        completion_request: payload.0,
    }) {
        Ok(_) => {
            return HttpResponse::Ok()
                .append_header(("Content-Type", "text/event-stream"))
                .append_header(("Cache-Control", "no-cache"))
                .keep_alive()
                .streaming(stream)
        }
        Err(_) => {
            return HttpResponse::InternalServerError().body("Failed to send request to thread.")
        }
    };
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
            prefer_mmap: false,
            n_context_tokens: 8472,
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

    INFERENCE_THREAD_TX
        .write()
        .replace(initialize_inference_thread(model));

    // let mut model_opt = LOADED_MODEL.write();
    // *model_opt = Some(model);

    // let mut modelmap = LOADED_MODELMAP.lock();
    // modelmap.insert(name.to_string(), model);

    Ok(())
}
