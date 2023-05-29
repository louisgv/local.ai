import {
  LicenseType,
  type ModelMap,
  ModelType
} from "~features/model-downloader/model-file"

export const gpt4AllModelMap: ModelMap = {
  "GPT4All-J v1.3 Groovy": {
    description:
      "Current best commercially licensable model based on GPT-J and trained by Nomic AI on the latest curated GPT4All dataset.",
    modelType: ModelType.GptJ,
    downloadUrl: "https://gpt4all.io/models/ggml-gpt4all-j-v1.3-groovy.bin",
    sha256: "",
    blake3: "aaa",
    licenses: [LicenseType.Commercial]
  },

  "GPT4All-J L13B Snoozy": {
    description:
      "Current best non-commercially licensable model based on Llama 13b and trained by Nomic AI on the latest curated GPT4All dataset.",
    modelType: ModelType.Llama,
    downloadUrl: "https://gpt4all.io/models/ggml-gpt4all-l13b-snoozy.bin",
    sha256: "91f886b68fbce697e9a3cd501951e455",
    blake3: "e2b7b4b7c0b0b0b0b0b0b0b0b0b0b0b0",
    licenses: [LicenseType.NonCommercial]
  }
}
