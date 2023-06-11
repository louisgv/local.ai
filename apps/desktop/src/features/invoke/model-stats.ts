import type { InvokeCommand, InvokeIO } from "~features/invoke/_shared"

export type ModelStats = {
  loadCount: number
}

export type ModelStatsCommandMap = {
  [InvokeCommand.GetModelStats]: InvokeIO<{ path: string }, number>
}
