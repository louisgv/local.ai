import { gpt4AllModelMap } from "@models/gpt4all"
import { guanacoModelMap } from "@models/guanaco"
import { mptModelMap } from "@models/mpt"

import {
  type ModelDownloadInfo,
  toList
} from "~features/model-downloader/model-file"

export const modelList: ModelDownloadInfo[] = [
  ...toList(gpt4AllModelMap),
  ...toList(mptModelMap),
  ...toList(guanacoModelMap)

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
]

export const modelMap = modelList.reduce((acc, model) => {
  acc[model.blake3] = {
    ...model
  }
  return acc
}, {}) as Record<string, ModelDownloadInfo>
