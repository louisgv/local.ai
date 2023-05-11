use actix_web::dev::ServerHandle;
use actix_web::web::{Bytes, Json};

use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use once_cell::sync::Lazy;
use parking_lot::{Mutex, RwLock};
use rand::rngs::{OsRng, StdRng};
use rand::SeedableRng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::Write;
use tokio::io::AsyncWriteExt;
use tokio_util::codec::{BytesCodec, FramedRead};

use futures::StreamExt;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};

use futures::stream::{FuturesOrdered, FuturesUnordered};

use llm::{load_progress_callback_stdout, InferenceRequest, Model};

use std::{convert::Infallible, path::Path};

static LOADED_MODELMAP: Lazy<Mutex<HashMap<String, Box<dyn Model>>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

// Single model for now
static LOADED_MODEL: Lazy<Arc<RwLock<Option<Box<dyn Model>>>>> =
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

#[derive(Serialize, Deserialize, Debug, Clone)]
struct CompletionRequest {
    prompt: String,
    max_tokens: u32,
    temperature: f64,
    stream: bool,
}

#[derive(Serialize)]
pub struct Choice {
    text: String,
}

#[derive(Serialize)]
pub struct CompletionResponse {
    pub choices: Vec<Choice>,
}

#[get("/")]
async fn ping() -> impl Responder {
    HttpResponse::Ok().body("pong")
}

fn get_completion_resp(text: String) -> Vec<u8> {
    let completion_response = CompletionResponse {
        choices: vec![Choice { text }],
    };

    let serialized = serde_json::to_string(&completion_response).unwrap();

    format!("data: {}\n\n", serialized).as_bytes().to_vec()
}

fn remove_newlines(s: &str) -> String {
    s.replace("\n", "").replace("\r", "")
}

#[post("/completions")]
async fn post_completions(payload: Json<CompletionRequest>) -> impl Responder {
    let (mut to_write, to_read) = tokio::io::duplex(1024);

    let (tx, mut rx) = tauri::async_runtime::channel::<Vec<u8>>(100);

    tauri::async_runtime::spawn(async move {
        while let Some(data) = rx.recv().await {
            to_write.write_all(&data).await.unwrap();
        }
    });

    tauri::async_runtime::spawn(async move {
        let model_guard = Arc::clone(&LOADED_MODEL);

        let mut rng = rand::rngs::StdRng::from_entropy();

        let model_reader = model_guard.read();
        let model = model_reader.as_ref().unwrap();
        let mut session = model.start_session(Default::default());

        let raw_prompt = remove_newlines(payload.prompt.as_str()).clone();
        let prompt = &raw_prompt;

        println!("Prompt: {}", prompt);

        let res = session.infer::<Infallible>(
            model.as_ref(),
            &mut rng,
            &InferenceRequest {
                prompt,
                play_back_previous_tokens: false,
                ..Default::default()
            },
            // OutputRequest
            &mut Default::default(),
            |t| {
                // tx.try_send(get_completion_resp(t.to_string())).unwrap();

                // for each character in t, send a completion response
                for ch in t.chars() {
                    // for each character in t, send a completion response
                    tx.try_send(get_completion_resp(ch.to_string())).unwrap();
                }
                Ok(())
            },
        );
        match res {
            Ok(result) => println!("\n\nInference stats:\n{result}"),
            Err(err) => {
                tx.try_send(get_completion_resp(err.to_string())).unwrap();
            }
        }
    });

    let stream = FramedRead::new(to_read, BytesCodec::new()).map(|res| match res {
        Ok(bytes) => Ok(Bytes::copy_from_slice(&bytes)),
        Err(e) => Err(e),
    });

    HttpResponse::Ok()
        .append_header(("Content-Type", "text/event-stream"))
        .append_header(("Cache-Control", "no-cache"))
        .append_header(("Connection", "keep-alive"))
        .streaming(stream)
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
        // .disable_signals()
        .run();

    state.running.store(true, Ordering::SeqCst);
    *state.server.lock() = Some(server.handle());

    tauri::async_runtime::spawn(async move {
        // A loop that takes output from the async process and sends it
        // to the webview via a Tauri Event
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
pub async fn load_model(name: &str, path: &str, model_type: &str) -> Result<(), String> {
    let now = std::time::Instant::now();
    let model_path = Path::new(path);

    let architecture = model_type.parse().unwrap_or_else(|e| panic!("{e}"));

    let model = llm::load_dynamic(
        architecture,
        model_path,
        Default::default(),
        load_progress_callback_stdout,
    )
    .unwrap_or_else(|err| panic!("Failed to load model from {model_path:?}: {err}"));

    println!(
        "Model fully loaded! Elapsed: {}ms",
        now.elapsed().as_millis()
    );

    let mut model_opt = LOADED_MODEL.write();
    *model_opt = Some(model);

    // let mut modelmap = LOADED_MODELMAP.lock();
    // modelmap.insert(name.to_string(), model);

    Ok(())
}
