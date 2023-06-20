use std::path::{Path, PathBuf};

use llm::VocabularySource;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Clone, Default)]
pub struct ModelConfig {
  pub tokenizer: Option<String>,

  #[serde(rename = "defaultPromptTemplate")]
  pub default_prompt_template: Option<String>,
}

crate::macros::bucket_state::make!(ModelConfig, "model_config", "v1");

impl ModelConfig {
  fn determine_source(&self) -> Option<VocabularySource> {
    if let Some(v) = &self.tokenizer {
      let path = Path::new(v.as_str());
      if path.is_absolute() && path.exists() && path.is_file() {
        return Some(VocabularySource::HuggingFaceTokenizerFile(
          PathBuf::from(v),
        ));
      } else if !v.is_empty() {
        return Some(VocabularySource::HuggingFaceRemote(v.to_string()));
      }
    }
    None
  }

  pub fn get_vocab(&self) -> VocabularySource {
    self.determine_source().unwrap_or(VocabularySource::Model)
  }
}
