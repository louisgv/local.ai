import {
  LicenseType,
  type ModelMap,
  ModelType
} from "~features/model-downloader/model-file"

export const mptModelMap: ModelMap = {
  "MPT-7B": {
    description:
      "MPT-7B is a decoder-style transformer pretrained from scratch on 1T tokens of English text and code by MosaicML.",
    modelType: ModelType.Mpt,
    downloadUrl:
      "https://huggingface.co/rustformers/mpt-7b-ggml/resolve/main/mpt-7b-q4_0-ggjt.bin",
    sha256: "",
    blake3: "ccc",
    licenses: [
      LicenseType.Commercial,
      LicenseType.OpenSource,
      LicenseType.Apache2
    ]
  },
  "MPT-7B-Instruct": {
    name: "",
    description:
      "MPT-7B-Instruct is a model for short-form instruction following trained by MosaicML.",
    modelType: ModelType.Mpt,
    downloadUrl:
      "https://huggingface.co/rustformers/mpt-7b-ggml/resolve/main/mpt-7b-instruct-q4_0-ggjt.bin",
    sha256: "",
    blake3: "dddd",
    tags: ["instruct"],
    licenses: ["CC-By-SA-3.0", LicenseType.Commercial, LicenseType.OpenSource]
  },
  "MPT-7B-Chat": {
    description:
      "MPT-7B-Chat is a chatbot-like model for dialogue generation trained by MosaicML.",
    modelType: ModelType.Mpt,
    downloadUrl:
      "https://huggingface.co/rustformers/mpt-7b-ggml/resolve/main/mpt-7b-chat-q4_0-ggjt.bin",
    sha256: "",
    blake3: "eee",
    tags: ["chat"],
    licenses: ["CC-By-NC-SA-4.0", LicenseType.NonCommercial]
  }
}
