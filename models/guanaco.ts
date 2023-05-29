import {
  LicenseType,
  type ModelMap,
  ModelType
} from "~features/model-downloader/model-file"

export const guanacoModelMap: ModelMap = {
  "Guanaco 7B": {
    description: "A model fine-tuned using the QLoRA technique",
    modelType: ModelType.Llama,
    downloadUrl: "https://gpt4all.io/models/ggml-gpt4all-j-v1.3-groovy.bin",
    sha256: "",
    blake3: "sss",
    licenses: [LicenseType.Academic, LicenseType.NonCommercial],
    citation: ["https://arxiv.org/pdf/2305.14314.pdf"]
  }
}
