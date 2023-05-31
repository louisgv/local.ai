import { type ModelInfo, toList } from "@models/_shared"
import { gpt4AllModelMap } from "@models/gpt4all"
import { guanacoModelMap } from "@models/guanaco"
import { mptModelMap } from "@models/mpt"
import { wizardModelMap } from "@models/wizard"

export type ModelInfoList = ModelInfo[]

export const modelList: ModelInfoList = [
  ...toList(mptModelMap),
  ...toList(gpt4AllModelMap),
  ...toList(guanacoModelMap),
  ...toList(wizardModelMap)
]

export * from "@models/_shared"
