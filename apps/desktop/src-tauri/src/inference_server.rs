use bytes::Buf;
use http_body_util::{BodyExt, StreamBody};
use hyper::{
    body::Incoming as IncomingBody, server::conn::http1, service::service_fn, Method, Request,
    Response, StatusCode,
};

use futures::channel::mpsc::{self, Receiver};
use llm::{InferenceFeedback, InferenceParameters, InferenceResponse};
use once_cell::sync::Lazy;
use parking_lot::{Mutex, RwLock};
use rand::SeedableRng;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::HashMap;
use std::net::SocketAddr;
use tokio::net::TcpListener;

use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};

use llm::{load_progress_callback_stdout, InferenceRequest, Model};

use std::{convert::Infallible, path::Path};

use crate::abort_stream::AbortStream;

type GenericError = Box<dyn std::error::Error + Send + Sync>;
type ServerResult<T> = std::result::Result<T, GenericError>;
type ServerBody = StreamBody<AbortStream<Receiver<String>>>;

static _LOADED_MODELMAP: Lazy<Mutex<HashMap<String, Box<dyn Model>>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

// Single model for now
static LOADED_MODEL: Lazy<Arc<RwLock<Option<Box<dyn Model>>>>> =
    Lazy::new(|| Arc::new(RwLock::new(None)));

pub struct InferenceServerState {
    running: Arc<AtomicBool>,
}

impl Default for InferenceServerState {
    fn default() -> Self {
        Self {
            running: Arc::new(AtomicBool::new(false)),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
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

fn get_completion_resp(text: String) -> String {
    let completion_response = CompletionResponse {
        choices: vec![Choice { text }],
    };

    let serialized = serde_json::to_string(&completion_response).unwrap();

    format!("data: {}\n\n", serialized)
}

fn clean_prompt(s: &str) -> String {
    s.replacen("!", ".", 4)
        .replace("<bot>: ", "bot: ")
        .replace("\n<human>: ", "\n===\nhuman: ")
}

async fn post_completions(req: Request<IncomingBody>) -> ServerResult<Response<ServerBody>> {
    let whole_body = req.collect().await?.aggregate();

    let payload = serde_json::from_reader::<_, CompletionRequest>(whole_body.reader())?;

    let (mut sender, receiver) = mpsc::channel::<String>(0);

    let abort_flag = RefCell::new(false);

    let stream = AbortStream {
        stream: receiver,
        abort_flag: abort_flag.clone(), // handle: Arc::clone(&thread_handle),
    };

    rayon::spawn(move || {
        let mut rng = rand::rngs::StdRng::from_entropy();
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
            &mut rng,
            &InferenceRequest {
                prompt,
                play_back_previous_tokens: false,
                // maximum_token_count: Some(8472),
                parameters: Some(&InferenceParameters {
                    // n_batch: 4,
                    // n_threads: 2,
                    ..Default::default()
                }),
                ..Default::default()
            },
            // OutputRequest
            &mut Default::default(),
            |r| match r {
                InferenceResponse::InferredToken(t) => {
                    if !clocked {
                        time_to_first_token = timer.elapsed();
                        clocked = true;
                    }
                    sender.try_send(get_completion_resp(t)).unwrap();
                    // for ch in t.chars() {
                    //     // for each character in t, send a completion response
                    //     tx.try_send(get_completion_resp(ch.to_string())).unwrap();
                    // }
                    Ok(if *abort_flag.borrow() {
                        println!("CANCELED");
                        InferenceFeedback::Halt
                    } else {
                        InferenceFeedback::Continue
                    })
                }
                _ => Ok(if *abort_flag.borrow() {
                    InferenceFeedback::Halt
                } else {
                    InferenceFeedback::Continue
                }),
            },
        );

        match res {
            Ok(result) => {
                println!(
                    "\n\n===\n\nInference stats:\n\n{}\ntime_to_first_token: {}ms\n{}",
                    result,
                    time_to_first_token.as_millis(),
                    *abort_flag.borrow()
                );
            }
            Err(err) => {
                sender
                    .try_send(get_completion_resp(err.to_string()))
                    .unwrap();
            }
        };
    });

    let resp = Response::builder()
        .header("Content-Type", "text/event-stream")
        .header("Cache-Control", "no-cache")
        .header("Connection", "keep-alive")
        .body(StreamBody::new(stream))
        .unwrap();

    Ok(resp)
}

fn full<T: Into<String>>(chunk: T) -> ServerBody {
    let (mut sender, receiver) = mpsc::channel(0);
    let _ = sender.try_send(chunk.into());
    StreamBody::new(AbortStream {
        stream: receiver,
        abort_flag: RefCell::new(false),
    })
}

async fn server_request_handler(req: Request<IncomingBody>) -> ServerResult<Response<ServerBody>> {
    match (req.method(), req.uri().path()) {
        (&Method::GET, "/") | (&Method::GET, "/index.html") => {
            Ok(Response::new(full("HELLO WORLD")))
        }
        (&Method::POST, "/completions") => post_completions(req).await,
        _ => {
            // Return 404 not found response.
            Ok(Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(full("Not Found"))
                .unwrap())
        }
    }
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

    let running_clone = Arc::clone(&state.running);

    tauri::async_runtime::spawn(async move {
        let addr = SocketAddr::from(([127, 0, 0, 1], port));

        let listener = match TcpListener::bind(addr).await {
            Ok(listener) => listener,
            Err(err) => {
                println!("Failed to bind to port: {}", err);
                return;
            }
        };
        println!("Starting server on port {}", port);

        while running_clone.load(Ordering::SeqCst) {
            let (stream, _) = listener.accept().await.unwrap();

            tokio::task::spawn(async move {
                let service = service_fn(move |req| server_request_handler(req));

                if let Err(err) = http1::Builder::new()
                    .serve_connection(stream, service)
                    .await
                {
                    println!("Error serving connection: {:?}", err);
                }
            });
        }

        println!("Server stopped.");
    });

    Ok(())
}

#[tauri::command]
pub async fn stop_server<'a>(state: tauri::State<'a, InferenceServerState>) -> Result<(), String> {
    println!("Stopping server on port");

    if !state.running.load(Ordering::SeqCst) {
        return Err("Server is not running.".to_string());
    }

    state.running.store(false, Ordering::SeqCst);

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
            prefer_mmap: true,
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

    let mut model_opt = LOADED_MODEL.write();
    *model_opt = Some(model);

    // let mut modelmap = LOADED_MODELMAP.lock();
    // modelmap.insert(name.to_string(), model);

    Ok(())
}
