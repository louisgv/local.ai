import { LicenseType, type ModelMap, ModelType } from "./_shared"

const commonCitations = [
  "https://gpt4all.io/reports/GPT4All_Technical_Report_3.pdf",
  "https://gpt4all.io/reports/GPT4All_Technical_Report_2.pdf"
]

export const gpt4AllModelMap: ModelMap = {
  "GPT4All-J Groovy": {
    size: 4541706976,
    description:
      "Current best commercially licensable model based on GPT-J and trained by Nomic AI on the latest curated GPT4All dataset.",
    modelType: ModelType.GptJ,
    downloadUrl:
      "https://huggingface.co/rustformers/gpt4all-j-ggml/resolve/f61973ebcc39a991aecb997a839ae4cca962dd48/gpt4all-j-q5_1-ggjt.bin",
    blake3: "5ad4dbefbd002099b60dfe73fc1bec9ca86a06d21321ef3e23ce6b7a23ef3320",
    sha256: "7314a0aeb1332583947cdaeb61552b566ed42badf503c0e0bc436bcea7d7c919",
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
      "https://huggingface.co/TheBloke/GPT4All-13B-snoozy-GGML/resolve/1ecb0d84599229509cd4d7927a7b4a111c6cd97d/GPT4All-13B-snoozy.ggmlv3.q5_1.bin",
    size: 9763701888,
    blake3: "97394367c9438853472f0d91b4394bd51996f9bd8fc090b68759b6ef2c065674",
    sha256: "a2f7e626051b7d94525490f4b817b2f280dd0a0cf9c983bc5ec8691e69c49682",
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
