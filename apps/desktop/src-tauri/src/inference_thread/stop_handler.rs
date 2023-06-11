/// Based on https://github.com/LLukas22/llm-rs-python/blob/e2a6d459e39df9be14442676fa43397a3b8753a4/src/stopwords.rs#L33
/// Copyright (c) 2023 Lukas Kreussel
/// MIT License
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Clone, Serialize, Deserialize)]
struct Buffer<T> {
  pub data: Vec<T>,
  capacity: usize,
}

impl<T> Buffer<T> {
  fn new(capacity: usize) -> Self {
    Buffer {
      data: Vec::with_capacity(capacity),
      capacity,
    }
  }

  fn push(&mut self, item: T) {
    if self.data.len() == self.capacity {
      self.data.remove(0);
    }
    self.data.push(item);
  }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct StopHandler {
  pub stops: HashSet<Vec<u8>>,
  buffer: Buffer<u8>,
  capacity: usize,
}

impl StopHandler {
  pub fn new(model: &dyn llm::Model, stops: &[String]) -> StopHandler {
    let stop_tokens: HashSet<Vec<u8>> = stops
      .iter()
      .map(|word| {
        model
          .vocabulary()
          .tokenize(word, false)
          .unwrap()
          .iter()
          .flat_map(|(encoding, _)| encoding.to_owned())
          .collect::<Vec<u8>>()
      })
      .collect();

    let capacity = stop_tokens.iter().map(|v| v.len()).max().unwrap_or(0);

    StopHandler {
      stops: stop_tokens,
      buffer: Buffer::new(capacity),
      capacity,
    }
  }

  pub fn check(&mut self, new_tokens: &Vec<u8>) -> bool {
    if self.capacity == 0 {
      return false;
    }

    for token in new_tokens {
      self.buffer.push(token.to_owned());
      for i in 0..self.buffer.data.len() {
        let slice = self.buffer.data[i..].to_vec();
        if self.stops.contains(&slice) {
          return true;
        }
      }
    }
    false
  }
}
