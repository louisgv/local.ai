import { LicenseType, type ModelMap, ModelType } from "./_shared"

export const guanacoModelMap: ModelMap = {
  "REPLIT Code v1 3B": {
    description: "A model fine-tuned using the QLoRA technique",
    modelType: ModelType.Llama,
    size: 5055128192,
    downloadUrl:
      "https://huggingface.co/lukasmoeller/replit-code-v1-3b-ggml/tree/main",
    blake3: "abcdef",
    sha256: "plumbshake",
    licenses: [LicenseType.Academic, LicenseType.NonCommercial],
    citations: [
      "https://arxiv.org/pdf/2305.14314.pdf",
      "https://huggingface.co/TheBloke/guanaco-7B-GGML"
    ]
  }
}
