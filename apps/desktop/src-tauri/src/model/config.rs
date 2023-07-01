use std::path::{Path, PathBuf};

use llm::{ModelArchitecture, TokenizerSource};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Clone, Default)]
pub struct ModelConfig {
  #[serde(rename = "modelType")]
  model_type: Option<String>,

  tokenizer: Option<String>,

  #[serde(rename = "defaultPromptTemplate")]
  default_prompt_template: Option<String>,
}

crate::macros::bucket_state::make!(ModelConfig, "model_config", "v1");

impl ModelConfig {
  fn determine_source(&self) -> Option<TokenizerSource> {
    if let Some(v) = &self.tokenizer {
      let path = Path::new(v.as_str());
      if path.is_absolute() && path.exists() && path.is_file() {
        return Some(TokenizerSource::HuggingFaceTokenizerFile(PathBuf::from(
          v,
        )));
      } else if !v.is_empty() {
        return Some(TokenizerSource::HuggingFaceRemote(v.to_string()));
      }
    }
    None
  }

  pub fn get_tokenizer(&self) -> TokenizerSource {
    self.determine_source().unwrap_or(TokenizerSource::Embedded)
  }

  pub fn get_model_arch(&self) -> Result<Option<ModelArchitecture>, String> {
    let default_model_type = "llama".to_string();
    let model_type = self.model_type.as_ref().unwrap_or(&default_model_type);

    let architecture: ModelArchitecture = model_type
      .parse()
      .map_err(|_| format!("Invalid model type: {model_type}"))?;

    Ok(Some(architecture))
  }
}
