import { type ModelInfo, toList } from "./_shared"
import { dollyModelMap } from "./dolly"
import { gpt4AllModelMap } from "./gpt4all"
import { guanacoModelMap } from "./guanaco"
import { mptModelMap } from "./mpt"
import { wizardModelMap } from "./wizard"

export type ModelInfoList = ModelInfo[]

export const modelList: ModelInfoList = [
  ...toList(mptModelMap),
  ...toList(dollyModelMap),
  ...toList(gpt4AllModelMap),
  ...toList(guanacoModelMap),
  ...toList(wizardModelMap)
]

export * from "./_shared"
