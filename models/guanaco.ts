import {
  LicenseType,
  type ModelMap,
  ModelType
} from "~features/model-downloader/model-file"

export const guanacoModelMap: ModelMap = {
  "Guanaco 7B": {
    description: "A model fine-tuned using the QLoRA technique",
    modelType: ModelType.Llama,
    downloadUrl:
      "https://huggingface.co/TheBloke/guanaco-7B-GGML/resolve/main/guanaco-7B.ggmlv3.q5_1.bin",
    sha256: "",
    blake3: "sss",
    vocabulary: ["JosephusCheung/Guanaco"],
    licenses: [LicenseType.Academic, LicenseType.NonCommercial],
    citation: ["https://arxiv.org/pdf/2305.14314.pdf"]
  }
}
