import { LicenseType, type ModelMap, ModelType } from "./_shared"

const commonCitations = [
  "https://gpt4all.io/reports/GPT4All_Technical_Report_3.pdf",
  "https://gpt4all.io/reports/GPT4All_Technical_Report_2.pdf"
]

export const gpt4AllModelMap: ModelMap = {
  "GPT4All-J v1.3 Groovy": {
    description:
      "Current best commercially licensable model based on GPT-J and trained by Nomic AI on the latest curated GPT4All dataset.",
    modelType: ModelType.GptJ,
    downloadUrl:
      "https://huggingface.co/rustformers/gpt4all-j-ggml/resolve/main/gpt4all-j-q5_1-ggjt.bin",
    sha256: "",
    blake3: "aaa",
    licenses: [LicenseType.Commercial, LicenseType.OpenSource, LicenseType.GPL],
    citations: [
      ...commonCitations,
      "https://huggingface.co/rustformers/gpt4all-j-ggml"
    ]
  },

  "GPT4All-J 13B Snoozy": {
    description:
      "Current best non-commercially licensable model based on Llama 13b and trained by Nomic AI on the latest curated GPT4All dataset.",
    modelType: ModelType.Llama,
    downloadUrl:
      "https://huggingface.co/TheBloke/GPT4All-13B-snoozy-GGML/resolve/main/GPT4All-13B-snoozy.ggmlv3.q5_1.bin",
    sha256: "91f886b68fbce697e9a3cd501951e455",
    blake3: "e2b7b4b7c0b0b0b0b0b0b0b0b0b0b0b0",
    licenses: [LicenseType.NonCommercial],
    citations: [
      ...commonCitations,
      "https://huggingface.co/TheBloke/GPT4All-13B-snoozy-GGML"
    ]
  }
}

// {
//   downloadUrl: "https://gpt4all.io/models/ggml-vicuna-7b-1.1-q4_2.bin",
//   sha256: "29119f8fa11712704c6b22ac5ab792ea",
//   description:
//     "An non-commercially licensable model based on Llama 7b and trained by teams from UC Berkeley, CMU, Stanford, MBZUAI, and UC San Diego."
// },
// {
//   downloadUrl: "https://gpt4all.io/models/ggml-vicuna-13b-1.1-q4_2.bin",
//   sha256: "95999b7b0699e2070af63bf5d34101a8",
//   description:
//     "An non-commercially licensable model based on Llama 13b and trained by teams from UC Berkeley, CMU, Stanford, MBZUAI, and UC San Diego."
// },
// {
//   downloadUrl: "https://gpt4all.io/models/ggml-wizardLM-7B.q4_2.bin",
//   sha256: "99e6d129745a3f1fb1121abed747b05a",
//   description:
//     "An non-commercially licensable model based on Llama 7b and trained by Microsoft and Peking University."
// },
// {
//   downloadUrl: "https://gpt4all.io/models/ggml-stable-vicuna-13B.q4_2.bin",
//   sha256: "6cb4ee297537c9133bddab9692879de0",
//   description:
//     "An non-commercially licensable model based on Llama 13b and RLHF trained by Stable AI."
// }
