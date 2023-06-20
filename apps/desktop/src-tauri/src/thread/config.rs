use serde::{Deserialize, Serialize};

use crate::inference::completion::CompletionRequest;

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct ThreadConfig {
  #[serde(rename = "modelPath")]
  pub model_path: Option<String>,

  pub tokenizer: Option<String>,

  #[serde(rename = "promptTemplate")]
  pub prompt_template: Option<String>,

  #[serde(rename = "systemMessage")]
  pub system_message: Option<String>,

  #[serde(rename = "completionParams")]
  completion_params: Option<CompletionRequest>,
}

crate::macros::bucket_state::make!(ThreadConfig, "thread_config", "v1");
