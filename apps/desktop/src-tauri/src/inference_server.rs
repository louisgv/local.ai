use actix_web::dev::ServerHandle;
use actix_web::web::{Bytes, Json};

use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use once_cell::sync::Lazy;
use parking_lot::Mutex;
use rand::distributions::Alphanumeric;
use rand::rngs::{OsRng, StdRng};
use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;
use tokio::io::AsyncWriteExt;
use tokio::time::sleep;
use tokio_util::codec::{BytesCodec, FramedRead};

use futures::StreamExt;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};

use llm::{load_progress_callback_stdout, InferenceRequest, Model};

use std::{convert::Infallible, path::Path};

static LOADED_MODELMAP: Lazy<Mutex<HashMap<String, Box<dyn Model>>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

// Single model for now
static LOADED_MODEL: Lazy<Mutex<Option<Box<dyn Model>>>> = Lazy::new(|| Mutex::new(None));

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
    let model = {
        let guard = LOADED_MODEL.lock();
        let model = match guard.as_ref() {
            Some(model) => model,
            None => return HttpResponse::Ok().body("No model loaded"),
        };

        let mut session = model.start_session(Default::default());

        let prompt = "What is LLM?";

        let res = session.infer::<Infallible>(
            model.as_ref(),
            &mut rand::thread_rng(),
            &InferenceRequest {
                prompt,

                ..Default::default()
            },
            // OutputRequest
            &mut Default::default(),
            |t| Ok(()),
        );
    };
    HttpResponse::Ok().body("pong")
}

#[post("/completions")]
async fn post_completions(payload: Json<CompletionRequest>) -> impl Responder {
    let (mut to_write, to_read) = tokio::io::duplex(1024);

    tauri::async_runtime::spawn(async move {
        let mut rng = StdRng::from_rng(OsRng).unwrap();

        for i in 0..512 {
            // for every 5th iteration, random string is a space
            let random_string = if i % 5 == 0 {
                " ".to_string()
            } else {
                char::from(rng.sample(&Alphanumeric)).to_string()
            };

            let choice = Choice {
                text: random_string,
            };
            let completion_response = CompletionResponse {
                choices: vec![choice],
            };
            let serialized = serde_json::to_string(&completion_response).unwrap();

            to_write
                .write_all(format!("data: {}\n\n", serialized).as_bytes())
                .await
                .unwrap();

            sleep(Duration::from_millis(42)).await;
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

    let mut model_opt = LOADED_MODEL.lock();
    *model_opt = Some(model);

    // let mut modelmap = LOADED_MODELMAP.lock();
    // modelmap.insert(name.to_string(), model);

    Ok(())
}
