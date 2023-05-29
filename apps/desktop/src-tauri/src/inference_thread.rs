use std::{convert::Infallible, sync::Arc};

use actix_web::web::Bytes;
use flume::Sender;
use llm::{
    InferenceError, InferenceFeedback, InferenceParameters, Model, OutputRequest, Prompt,
    TokenUtf8Buffer,
};
use parking_lot::{Mutex, RwLock};

use rand::prelude::*;

use rand_chacha::ChaCha8Rng;
use serde::{Deserialize, Serialize};
use tokio::task::JoinHandle;

use crate::model_pool::{self, get_inference_params};

#[derive(Serialize, Deserialize, Debug)]
pub struct CompletionRequest {
    prompt: String,
    max_tokens: u32,
    temperature: f64,
    stream: bool,
}

pub type ModelGuard = Arc<Mutex<Option<Box<dyn Model>>>>;

pub struct InferenceThreadRequest {
    pub token_sender: Sender<Bytes>,
    pub abort_flag: Arc<RwLock<bool>>,

    pub model_guard: ModelGuard,
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

// Perhaps might be better to clone the model for each thread...
pub fn start_inference(req: InferenceThreadRequest) -> Option<JoinHandle<()>> {
    println!("Starting inference ...");

    // Need to clone it to have its own arc
    let guard_clone = Arc::clone(&req.model_guard);
    let guard = guard_clone.lock();
    let model = match &*guard {
        Some(m) => m,
        None => {
            println!("Model locked, cannot be loaded");
            return None;
        }
    };

    let mut session = model.start_session(Default::default());
    println!("Session created ...");

    let raw_prompt = clean_prompt(req.completion_request.prompt.as_str());
    let prompt = &raw_prompt;
    let mut output_request = OutputRequest::default();

    let inference_params = get_inference_params();

    // Manual tokenization if needed
    // let vocab = model.vocabulary();
    // let prompt_tokens: Vec<i32> = vocab
    //     .tokenize(prompt, true)
    //     .into_par_iter() // Flatten to create a parallel iterator over the tuples
    //     .flatten() // Flatten the nested vectors
    //     .map(|(_, tok)| tok)
    //     .collect();

    // for batch in prompt_tokens.chunks(inference_params.n_batch) {
    //     model.evaluate(&mut session, inference_params, batch, &mut output_request);
    //     for &tk in batch {
    //         // Update the tokens for this session
    //         session.tokens.push(tk);
    //     }
    // }

    println!("Feeding prompt ...");
    match session.feed_prompt::<Infallible, Prompt>(
        model.as_ref(),
        &inference_params,
        prompt.into(),
        &mut output_request,
        |_| Ok(InferenceFeedback::Continue),
    ) {
        Ok(_) => {}
        Err(e) => {
            println!("Error while feeding prompt: {:?}", e);
            return None;
        }
    }

    let handle = spawn_inference_thread(req, inference_params, session, output_request);
    Some(handle)
}

fn spawn_inference_thread(
    req: InferenceThreadRequest,
    inference_params: InferenceParameters,
    mut session: llm::InferenceSession,
    mut output_request: OutputRequest,
) -> JoinHandle<()> {
    println!("Spawning inference thread...");
    let handle = actix_web::rt::task::spawn_blocking(move || {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let mut tokens_processed = 0;
        let maximum_token_count = usize::MAX;
        let mut token_utf8_buf = TokenUtf8Buffer::new();
        let guard = req.model_guard.lock();
        let model = match &*guard {
            Some(m) => m,
            None => {
                println!("Model locked, cannot be loaded");
                return;
            }
        };

        while tokens_processed < maximum_token_count {
            if *Arc::clone(&req.abort_flag).read() {
                break;
            }

            let token = match session.infer_next_token(
                model.as_ref(),
                &inference_params,
                &mut output_request,
                &mut rng,
            ) {
                Ok(t) => t,
                Err(InferenceError::EndOfText) => {
                    break;
                }
                Err(e) => {
                    println!("{}", e.to_string());
                    break;
                }
            };

            // Buffer the token until it's valid UTF-8, then call the callback.
            if let Some(tokens) = token_utf8_buf.push(&token) {
                match req.token_sender.send(get_completion_resp(tokens)) {
                    Ok(_) => {}
                    Err(e) => {
                        println!("Error while sending token: {:?}", e);
                        break;
                    }
                }
            }

            tokens_processed += 1;
        }
        // TODO: Might make this into a callback later, for now we just abuse the singleton

        model_pool::return_model(Some(Arc::clone(&req.model_guard)));

        // Run inference
        // let res = session.infer::<Infallible>(
        //     model.as_ref(),
        //     &mut rng,
        //     &InferenceRequest {
        //         prompt,
        //         play_back_previous_tokens: false,
        //         // maximum_token_count: Some(8472),
        //         parameters: Some(&InferenceParameters {
        //             // n_batch: 4,
        //             // n_threads: 2,
        //             ..Default::default()
        //         }),
        //         ..Default::default()
        //     },
        //     // OutputRequest
        //     &mut Default::default(),
        //     |r| match r {
        //         InferenceResponse::InferredToken(t) => {
        //             tx_token.try_send(get_completion_resp(t)).unwrap();
        //             // for ch in t.chars() {
        //             //     // for each character in t, send a completion response
        //             //     tx.try_send(get_completion_resp(ch.to_string())).unwrap();
        //             // }

        //             Ok(if *Arc::clone(&req.abort_token).read() {
        //                 InferenceFeedback::Halt
        //             } else {
        //                 InferenceFeedback::Continue
        //             })
        //         }
        //         _ => Ok(if *Arc::clone(&req.abort_token).read() {
        //             InferenceFeedback::Halt
        //         } else {
        //             InferenceFeedback::Continue
        //         }),
        //     },
        // );

        // match res {
        //     Ok(result) => {
        //         println!(
        //             "\n\n===\n\nInference stats:\n\n{}\naborted: {}\n",
        //             result,
        //             *Arc::clone(&req.abort_token).read()
        //         );
        //     }
        //     Err(err) => {
        //         tx_token
        //             .try_send(get_completion_resp(err.to_string()))
        //             .unwrap();
        //     }
        // }
    });
    handle
}
