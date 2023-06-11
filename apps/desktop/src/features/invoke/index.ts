import type { ModelType } from "@models/_shared"

import type { ModelDownloaderCommandMap } from "~features/invoke/model-downloader"
import type { ModelIntegrityCommandMap } from "~features/invoke/model-integrity"
import type { ModelStatsCommandMap } from "~features/invoke/model-stats"
import type { ModelsDirectoryCommandMap } from "~features/invoke/models-directory"
import type { ThreadsDirectoryCommandMap } from "~features/invoke/threads-directory"

import { InvokeCommand, type InvokeIO } from "./_shared"

export { InvokeCommand }

type InvokeCommandMap = {
  [commands in InvokeCommand]: InvokeIO
} & {
  [InvokeCommand.OpenDirectory]: InvokeIO<{ path: string }>
  [InvokeCommand.GetConfig]: InvokeIO<{ key: string }, string>

  [InvokeCommand.GetModelType]: InvokeIO<{ path: string }, ModelType>
  [InvokeCommand.SetModelType]: InvokeIO<{ path: string; modelType: ModelType }>

  [InvokeCommand.StartServer]: InvokeIO<{ port: number }, string>
  [InvokeCommand.StopServer]: InvokeIO<never, string>
} & ModelIntegrityCommandMap &
  ModelStatsCommandMap &
  ModelDownloaderCommandMap &
  ThreadsDirectoryCommandMap &
  ModelsDirectoryCommandMap

export async function invoke<T extends InvokeCommand>(
  cmd: T,
  ...[args]: InvokeCommandMap[T]["input"] extends never
    ? []
    : [InvokeCommandMap[T]["input"]]
) {
  const { invoke: _invoke } = await import("@tauri-apps/api/tauri")
  return _invoke<InvokeCommandMap[T]["output"]>(cmd, args)
}
