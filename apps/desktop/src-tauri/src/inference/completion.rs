use actix_web::web::Bytes;
use llm::{samplers::TopPTopK, Model};
use rand::prelude::*;
use serde::{Deserialize, Serialize};

use rand_chacha::ChaCha8Rng;

use super::stop_handler::StopHandler;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum StopSequence {
  Single(String),
  Multiple(Vec<String>),
}

impl StopSequence {
  fn as_ref(&self) -> &[String] {
    match self {
      StopSequence::Single(s) => std::slice::from_ref(s),
      StopSequence::Multiple(v) => v.as_slice(),
    }
  }
}

impl Default for StopSequence {
  fn default() -> Self {
    StopSequence::Multiple(vec!["Human:".to_string(), "AI:".to_string()])
  }
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct CompletionRequest {
  pub prompt: String,
  stream: Option<bool>,

  max_tokens: Option<usize>,

  seed: Option<u64>,
  temperature: Option<f32>,
  top_k: Option<usize>,
  top_p: Option<f32>,
  frequency_penalty: Option<f32>,
  presence_penalty: Option<f32>,

  stop_sequences: Option<StopSequence>,
  stop: Option<StopSequence>,
}

impl CompletionRequest {
  // pub fn is_stream(&self) -> bool {
  //   self.stream.unwrap_or(false)
  // }

  pub fn get_max_tokens(&self) -> usize {
    let max_tokens = self.max_tokens.unwrap_or(usize::MAX);
    if max_tokens == 0 {
      usize::MAX
    } else {
      max_tokens
    }
  }

  pub fn get_rng(&self) -> ChaCha8Rng {
    ChaCha8Rng::seed_from_u64(self.seed.unwrap_or(147))
  }

  pub fn get_frequency_penalty(&self) -> f32 {
    self.frequency_penalty.unwrap_or(0.6)
  }

  pub fn get_repeat_penalty(&self) -> f32 {
    (self.get_frequency_penalty() + 2.0) / 2.0
  }

  pub fn get_presence_penalty(&self) -> f32 {
    self.presence_penalty.unwrap_or(0.0)
  }

  pub fn get_repetition_penalty_last_n(&self) -> usize {
    256 + (((self.get_presence_penalty() + 2.0) / 4.0 * 512.0) as usize)
  }

  pub fn get_stop_handler(&self, model: &dyn Model) -> StopHandler {
    let default_seq = StopSequence::default();
    let stop_sequence = if let Some(stop) = self.stop.as_ref() {
      stop.as_ref()
    } else if let Some(stop_sequences) = self.stop_sequences.as_ref() {
      stop_sequences.as_ref()
    } else {
      default_seq.as_ref()
    };

    StopHandler::new(model, stop_sequence)
  }

  pub fn to_top_p_top_k(&self) -> TopPTopK {
    TopPTopK {
      temperature: self.temperature.unwrap_or(1.0),
      top_k: self.top_k.unwrap_or(42),
      top_p: self.top_p.unwrap_or(1.0),
      repeat_penalty: self.get_repeat_penalty(),
      repetition_penalty_last_n: self.get_repetition_penalty_last_n(),

      ..Default::default()
    }
  }
}

#[derive(Serialize)]
struct Choice {
  text: String,
}

#[derive(Serialize)]
pub struct CompletionResponse {
  choices: Vec<Choice>,
}

impl CompletionResponse {
  pub fn to_data_bytes(text: String) -> Bytes {
    let completion_response = CompletionResponse {
      choices: vec![Choice { text }],
    };

    let serialized = serde_json::to_string(&completion_response).unwrap();

    Bytes::from(format!("data: {}\n\n", serialized))
  }

  pub fn done() -> Bytes {
    Bytes::from("data: [DONE]")
  }
}
