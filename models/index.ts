import { type ModelInfo, toList } from "@models/_shared"
import { gpt4AllModelMap } from "@models/gpt4all"
import { guanacoModelMap } from "@models/guanaco"
import { mptModelMap } from "@models/mpt"

export type ModelInfoList = ModelInfo[]

export const modelList: ModelInfoList = [
  ...toList(guanacoModelMap),
  ...toList(mptModelMap),
  ...toList(gpt4AllModelMap)
]

export * from "@models/_shared"
