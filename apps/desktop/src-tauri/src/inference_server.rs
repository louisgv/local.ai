use actix_web::dev::ServerHandle;
use actix_web::web::Json;

use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use llm::{InferenceFeedback, InferenceParameters, InferenceResponse};
use once_cell::sync::Lazy;
use parking_lot::{Mutex, RwLock};
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

static _LOADED_MODELMAP: Lazy<Mutex<HashMap<String, Box<dyn Model>>>> =
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

fn clean_prompt(s: &str) -> String {
    s.replacen("!", ".", 4)
        .replace("<bot>: ", "bot: ")
        .replace("\n<human>: ", "\n===\nhuman: ")
}

#[post("/completions")]
async fn post_completions(payload: Json<CompletionRequest>) -> impl Responder {
    let (tx, rx) = flume::unbounded::<Vec<u8>>();

    let (mut to_write, to_read) = tokio::io::duplex(1024 * 1024);

    tokio::spawn(async move {
        while let Ok(data) = rx.recv_async().await {
            to_write.write_all(&data).await.unwrap();
        }
    });

    let thread_handle = Arc::new(tokio::task::spawn_blocking(move || {
        let model_guard = Arc::clone(&LOADED_MODEL);

        let model_reader = model_guard.read();
        let model = model_reader.as_ref().unwrap().clone();

        let mut session = model.start_session(Default::default());

        let raw_prompt = clean_prompt(payload.prompt.as_str()).clone();
        let prompt = &raw_prompt;

        println!(">>> Prompt:\n{}", prompt);

        let timer = std::time::Instant::now();
        let mut time_to_first_token = timer.elapsed();
        let mut clocked = false;

        let res = session.infer::<Infallible>(
            model.as_ref(),
            &mut rand::thread_rng(),
            &InferenceRequest {
                prompt,
                play_back_previous_tokens: false,
                maximum_token_count: Some(8472),
                parameters: Some(&InferenceParameters {
                    // n_batch: 4,
                    // n_threads: 2,
                    ..Default::default()
                }),
            },
            // OutputRequest
            &mut Default::default(),
            |r| match r {
                InferenceResponse::InferredToken(t) => {
                    if !clocked {
                        time_to_first_token = timer.elapsed();
                        clocked = true;
                    }
                    tx.send(get_completion_resp(t)).unwrap();
                    // for ch in t.chars() {
                    //     // for each character in t, send a completion response
                    //     tx.try_send(get_completion_resp(ch.to_string())).unwrap();
                    // }

                    Ok(InferenceFeedback::Continue)
                }
                _ => Ok(InferenceFeedback::Continue),
            },
        );
        match res {
            Ok(result) => {
                println!(
                    "\n\n===\n\nInference stats:\n\n{}\ntime_to_first_token: {}ms",
                    result,
                    time_to_first_token.as_millis()
                );
            }
            Err(err) => {
                tx.send(get_completion_resp(err.to_string())).unwrap();
            }
        };
    }));

    let stream = AbortStream {
        inner: FramedRead::new(to_read, BytesCodec::new()).map(|res| match res {
            Ok(bytes) => Ok(bytes.freeze().into()),
            Err(e) => Err(e.into()),
        }),
        handle: Arc::clone(&thread_handle),
    };

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
pub async fn load_model(path: &str, model_type: &str) -> Result<(), String> {
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
        Default::default(),
        load_progress_callback_stdout,
    ) {
        Ok(model) => model,
        Err(err) => return Err(format!("Error loading model: {}", err)),
    };

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
