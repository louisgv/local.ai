use once_cell::sync::Lazy;
use std::{convert::Infallible, sync::Arc};

use actix_web::web::Bytes;
use flume::{unbounded, Receiver, Sender};
use llm::{InferenceFeedback, InferenceParameters, InferenceRequest, InferenceResponse, Model};
use parking_lot::RwLock;
use rand::thread_rng;
use serde::{Deserialize, Serialize};

// Single model for now
static LOADED_MODEL: Lazy<Arc<RwLock<Option<Box<dyn Model>>>>> =
    Lazy::new(|| Arc::new(RwLock::new(None)));

#[derive(Serialize, Deserialize, Debug)]
pub struct CompletionRequest {
    prompt: String,
    max_tokens: u32,
    temperature: f64,
    stream: bool,
}

#[derive(Debug)]
pub struct InferenceThreadRequest {
    pub tx_token: Sender<Bytes>,
    pub abort_token: Arc<RwLock<bool>>,

    pub completion_request: CompletionRequest,
}

#[derive(Serialize)]
pub struct Choice {
    text: String,
}

#[derive(Serialize)]
pub struct CompletionResponse {
    pub choices: Vec<Choice>,
}

fn get_completion_resp(text: String) -> Bytes {
    let completion_response = CompletionResponse {
        choices: vec![Choice { text }],
    };

    let serialized = serde_json::to_string(&completion_response).unwrap();

    Bytes::from(format!("data: {}\n\n", serialized))
}

fn clean_prompt(s: &str) -> String {
    s.replacen("!", ".", 4)
        .replace("<bot>: ", "bot: ")
        .replace("\n<human>: ", "\n===\nhuman: ")
}

pub fn initialize_inference_thread(model: Box<dyn Model>) -> Sender<InferenceThreadRequest> {
    // Create a channel for InferenceRequests and spawn a thread to handle them
    let (tx, rx) = unbounded();

    std::thread::spawn(move || {
        let rx: Receiver<InferenceThreadRequest> = rx.clone();
        loop {
            if let Ok(req) = rx.recv_timeout(std::time::Duration::from_millis(4200)) {
                let mut session = model.start_session(Default::default());

                let mut rng = thread_rng();

                let raw_prompt = clean_prompt(req.completion_request.prompt.as_str()).clone();
                let prompt = &raw_prompt;
                let tx_token = req.tx_token.clone();

                // Run inference
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
                            tx_token.try_send(get_completion_resp(t)).unwrap();
                            // for ch in t.chars() {
                            //     // for each character in t, send a completion response
                            //     tx.try_send(get_completion_resp(ch.to_string())).unwrap();
                            // }

                            Ok(if *Arc::clone(&req.abort_token).read() {
                                InferenceFeedback::Halt
                            } else {
                                InferenceFeedback::Continue
                            })
                        }
                        _ => Ok(if *Arc::clone(&req.abort_token).read() {
                            InferenceFeedback::Halt
                        } else {
                            InferenceFeedback::Continue
                        }),
                    },
                );

                match res {
                    Ok(result) => {
                        println!(
                            "\n\n===\n\nInference stats:\n\n{}\naborted: {}\n",
                            result,
                            *Arc::clone(&req.abort_token).read()
                        );
                    }
                    Err(err) => {
                        tx_token
                            .try_send(get_completion_resp(err.to_string()))
                            .unwrap();
                    }
                };
            }
        }
    });

    tx
}
