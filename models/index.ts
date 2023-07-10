import { type ModelInfo, toList } from "./_shared"
import { dollyModelMap } from "./dolly"
import { gpt4AllModelMap } from "./gpt4all"
import { guanacoModelMap } from "./guanaco"
import { mptModelMap } from "./mpt"
import { nousHermesMap } from "./nous-hermes"
import { orcaMap } from "./orca"
import { redpajamaModelMap } from "./redpajama"
import { wizardModelMap } from "./wizard"

export type ModelInfoList = ModelInfo[]

export const modelList: ModelInfoList = [
  ...toList(dollyModelMap),
  ...toList(redpajamaModelMap),
  ...toList(mptModelMap),
  ...toList(gpt4AllModelMap),
  ...toList(guanacoModelMap),
  ...toList(wizardModelMap),
  ...toList(nousHermesMap),
  ...toList(orcaMap)
]

export * from "./_shared"
