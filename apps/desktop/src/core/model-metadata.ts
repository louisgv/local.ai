export const modelList = [
  {
    downloadUrl: "https://gpt4all.io/models/ggml-gpt4all-j-v1.3-groovy.bin",
    md5Hash: "81a09a0ddf89690372fc296ff7f625af",
    description:
      "Current best commercially licensable model based on GPT-J and trained by Nomic AI on the latest curated GPT4All dataset."
  },
  {
    downloadUrl: "https://gpt4all.io/models/ggml-gpt4all-l13b-snoozy.bin",
    md5Hash: "91f886b68fbce697e9a3cd501951e455",
    description:
      "Current best non-commercially licensable model based on Llama 13b and trained by Nomic AI on the latest curated GPT4All dataset."
  },
  {
    downloadUrl: "https://gpt4all.io/models/ggml-gpt4all-j-v1.2-jazzy.bin",
    md5Hash: "879344aaa9d62fdccbda0be7a09e7976",
    description:
      "An commercially licensable model based on GPT-J and trained by Nomic AI on the v2 GPT4All dataset."
  },
  {
    downloadUrl: "https://gpt4all.io/models/ggml-gpt4all-j-v1.1-breezy.bin",
    md5Hash: "61d48a82cb188cceb14ebb8082bfec37",
    description:
      "An commercially licensable model based on GPT-J and trained by Nomic AI on the v1 GPT4All dataset."
  },
  {
    downloadUrl: "https://gpt4all.io/models/ggml-gpt4all-j.bin",
    md5Hash: "5b5a3f9b858d33b29b52b89692415595",
    description:
      "An commercially licensable model based on GPT-J and trained by Nomic AI on the v0 GPT4All dataset."
  },
  {
    downloadUrl: "https://gpt4all.io/models/ggml-vicuna-7b-1.1-q4_2.bin",
    md5Hash: "29119f8fa11712704c6b22ac5ab792ea",
    description:
      "An non-commercially licensable model based on Llama 7b and trained by teams from UC Berkeley, CMU, Stanford, MBZUAI, and UC San Diego."
  },
  {
    downloadUrl: "https://gpt4all.io/models/ggml-vicuna-13b-1.1-q4_2.bin",
    md5Hash: "95999b7b0699e2070af63bf5d34101a8",
    description:
      "An non-commercially licensable model based on Llama 13b and trained by teams from UC Berkeley, CMU, Stanford, MBZUAI, and UC San Diego."
  },
  {
    downloadUrl: "https://gpt4all.io/models/ggml-wizardLM-7B.q4_2.bin",
    md5Hash: "99e6d129745a3f1fb1121abed747b05a",
    description:
      "An non-commercially licensable model based on Llama 7b and trained by Microsoft and Peking University."
  },
  {
    downloadUrl: "https://gpt4all.io/models/ggml-stable-vicuna-13B.q4_2.bin",
    md5Hash: "6cb4ee297537c9133bddab9692879de0",
    description:
      "An non-commercially licensable model based on Llama 13b and RLHF trained by Stable AI."
  }
]

export const modelMap = modelList.reduce((acc, model) => {
  acc[model.md5Hash] = {
    ...model
  }
  return acc
}, {}) as Record<string, (typeof modelList)[0]>
