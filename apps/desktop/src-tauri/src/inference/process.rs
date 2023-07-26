/// Inference thread as in Machine Physical Thread
use std::{convert::Infallible, sync::Arc};

use actix_web::web::Bytes;
use flume::Sender;
use llm::{
  InferenceError, InferenceFeedback, InferenceParameters, InferenceStats,
  Model, OutputRequest, Prompt, TokenUtf8Buffer,
};
use parking_lot::{Mutex, RwLock};

use tokio::task::JoinHandle;

use crate::model::{self, pool::get_use_gpu};

use super::completion::{CompletionRequest, CompletionResponse};

pub type ModelGuard = Arc<Mutex<Option<Box<dyn Model>>>>;

pub struct InferenceThreadRequest {
  pub token_sender: Sender<Bytes>,
  pub abort_flag: Arc<RwLock<bool>>,
  pub model_guard: ModelGuard,
  pub completion_request: CompletionRequest,
  pub nonstream_completion_tokens: Arc<Mutex<String>>,
  pub stream: bool,
  pub tx: Option<Sender<()>>,
}

impl InferenceThreadRequest {
  pub fn is_aborted(&self) -> bool {
    *self.abort_flag.read() || self.token_sender.is_disconnected()
  }

  pub fn send_comment(&self, message: &str) {
    self
      .token_sender
      .send(Bytes::from(format!(": {} \n\n", message)))
      .unwrap();
  }

  pub fn send_event(&self, event_name: &str) {
    self
      .token_sender
      .send(Bytes::from(format!("event: {} \n\n", event_name)))
      .unwrap();
  }

  pub fn send_done(&self) {
    if self.token_sender.is_disconnected() {
      return;
    }

    self.token_sender.send(Bytes::from("data: [DONE]")).unwrap();
  }

  pub fn send_error(&self, error: String) {
    println!("{}", error);
    self
      .token_sender
      .send(CompletionResponse::to_data_bytes(error))
      .unwrap();
    self.send_done();
  }
}

fn get_inference_params(
  completion_request: &CompletionRequest,
) -> InferenceParameters {
  let n_threads = model::pool::get_n_threads();

  let n_batch = if get_use_gpu() { 240 } else { n_threads };

  InferenceParameters {
    n_threads,
    n_batch,
    sampler: Arc::new(completion_request.to_top_p_top_k()),
  }
}

// Perhaps might be better to clone the model for each thread...
pub fn start<'a>(req: InferenceThreadRequest) -> JoinHandle<()> {
  println!("Spawning inference thread...");
  actix_web::rt::task::spawn_blocking(move || {
    let mut rng = req.completion_request.get_rng();

    let maximum_token_count = req.completion_request.get_max_tokens();

    let mut token_utf8_buf = TokenUtf8Buffer::new();
    let guard = req.model_guard.lock();
    let stream_enabled = req.stream;
    let mut nonstream_res_str_buf = req.nonstream_completion_tokens.lock();

    let model = match guard.as_ref() {
      Some(m) => m,
      None => {
        println!("Model locked, cannot be loaded");
        return;
      }
    };

    let mut session = model.start_session(Default::default());

    let mut output_request = OutputRequest::default();

    let inference_params = get_inference_params(&req.completion_request);

    let mut stats = InferenceStats::default();
    let start_at = std::time::SystemTime::now();

    println!("Feeding prompt ...");

    if stream_enabled {
      req.send_event("FEEDING_PROMPT");
    }

    match session.feed_prompt::<Infallible, Prompt>(
      model.as_ref(),
      &inference_params,
      req.completion_request.prompt.as_str().into(),
      &mut output_request,
      |t| {
        if req.is_aborted() {
          return Ok(InferenceFeedback::Halt);
        }

        if let Some(token) = token_utf8_buf.push(t) {
          if stream_enabled {
            req.send_comment(format!("Processing token: {:?}", token).as_str());
          }
        }

        Ok(InferenceFeedback::Continue)
      },
    ) {
      Ok(_) => {
        stats.feed_prompt_duration = start_at.elapsed().unwrap();

        println!(
          "Done feeding prompt ... in {:?}",
          stats.feed_prompt_duration
        );
      }
      Err(e) => {
        req.send_error(e.to_string());
        return;
      }
    };

    if stream_enabled {
      req.send_comment("Generating tokens ...");
      req.send_event("GENERATING_TOKENS");
    }

    // Reset the utf8 buf
    token_utf8_buf = TokenUtf8Buffer::new();

    let mut stop_handler =
      req.completion_request.get_stop_handler(model.as_ref());

    let mut tokens_processed = 0;

    while tokens_processed < maximum_token_count {
      if req.is_aborted() {
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
          req.send_error(e.to_string());
          break;
        }
      };

      if stop_handler.check(&token) {
        break;
      }

      // Buffer the token until it's valid UTF-8, then call the callback.
      if let Some(tokens) = token_utf8_buf.push(&token) {
        if req.stream {
          match req
            .token_sender
            .send(CompletionResponse::to_data_bytes(tokens))
          {
            Ok(_) => {}
            Err(_) => {
              break;
            }
          }
        } else {
          //Collect tokens into str buffer
          *nonstream_res_str_buf += &tokens;
        }
      }

      tokens_processed += 1;
    }

    stats.predict_duration = start_at.elapsed().unwrap();
    stats.predict_tokens = tokens_processed;

    println!("Inference stats: {:?}", stats);

    if stream_enabled {
      if !req.token_sender.is_disconnected() {
        req.send_done();
      }
    } else {
      if let Some(tx) = req.tx {
        //Tell server thread that inference completed, and let it respond
        let _ = tx.send(());
      }
    }

    // TODO: Might make this into a callback later, for now we just abuse the singleton
    model::pool::return_model(Some(Arc::clone(&req.model_guard)));

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
