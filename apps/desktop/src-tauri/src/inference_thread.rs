use std::{convert::Infallible, sync::Arc};

use actix_web::web::Bytes;
use flume::Sender;
use llm::{
    InferenceError, InferenceFeedback, InferenceParameters, Model, OutputRequest, TokenUtf8Buffer,
};
use parking_lot::RwLock;

use rand::prelude::*;

use rand_chacha::ChaCha8Rng;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CompletionRequest {
    prompt: String,
    max_tokens: u32,
    temperature: f64,
    stream: bool,
}

pub type ModelGuard = Arc<RwLock<Option<Box<(dyn Model)>>>>;

pub fn with_model<T, F: FnOnce(&Box<(dyn Model)>) -> T>(
    model_guard: &ModelGuard,
    f: F,
) -> Result<T, &'static str> {
    let guard = model_guard.read();
    guard
        .as_ref()
        .map(|m| f(m))
        .ok_or("Model locked, cannot be loaded")
}

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

pub fn spawn_inference_thread(req: InferenceThreadRequest) {
    rayon::spawn(move || {
        let mut session = with_model(&req.model_guard, |model| {
            model.start_session(Default::default())
        })
        .unwrap();

        let mut rng = ChaCha8Rng::seed_from_u64(42);

        let raw_prompt = clean_prompt(req.completion_request.prompt.as_str());
        let prompt = &raw_prompt;
        let mut output_request = OutputRequest::default();

        let inference_params = &InferenceParameters {
            // n_batch: 4,
            // n_threads: 2,
            ..Default::default()
        };

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

        with_model(&req.model_guard, |model| {
            session.feed_prompt::<Infallible>(
                model.as_ref(),
                &inference_params,
                prompt,
                &mut output_request,
                |_| Ok(InferenceFeedback::Continue),
            )
        })
        .unwrap()
        .unwrap();

        let mut tokens_processed = 0;
        let maximum_token_count = usize::MAX;

        let mut token_utf8_buf = TokenUtf8Buffer::new();

        while tokens_processed < maximum_token_count {
            if *Arc::clone(&req.abort_flag).read() {
                break;
            }
            let mut end_of_text = false;
            with_model(&req.model_guard, |model| {
                let token = match session.infer_next_token(
                    model.as_ref(),
                    &inference_params,
                    &mut output_request,
                    &mut rng,
                ) {
                    Ok(t) => t,
                    Err(InferenceError::EndOfText) => {
                        end_of_text = true;
                        &[0]
                    }
                    Err(e) => {
                        println!("{}", e.to_string());
                        end_of_text = true;
                        &[0]
                    }
                };

                // Buffer the token until it's valid UTF-8, then call the callback.
                if !end_of_text {
                    if let Some(tokens) = token_utf8_buf.push(token) {
                        req.token_sender
                            .try_send(get_completion_resp(tokens))
                            .unwrap();
                    }
                }
            })
            .unwrap();

            if end_of_text {
                break;
            }

            tokens_processed += 1;
        }

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
    })
}
