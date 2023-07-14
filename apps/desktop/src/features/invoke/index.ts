import type { ModelCommandMap } from "~features/invoke/model"
import type { ServerCommandMap } from "~features/invoke/server"
import type { ThreadCommandMap } from "~features/invoke/thread"

import { InvokeCommand, type InvokeIO } from "./_shared"

export { InvokeCommand }

type InvokeCommandMap = {
  [InvokeCommand.TestModel]: InvokeIO
  [InvokeCommand.LoadModel]: InvokeIO

  [InvokeCommand.OpenDirectory]: InvokeIO<{ path: string }>
  [InvokeCommand.GetConfig]: InvokeIO<{ path: string }, { data: string }>
  [InvokeCommand.SetConfig]: InvokeIO<{ path: string; data: string }>
} & ThreadCommandMap &
  ModelCommandMap &
  ServerCommandMap

export type ValidCommand = keyof InvokeCommandMap

export async function invoke<T extends ValidCommand>(
  cmd: T,
  ...[args]: InvokeCommandMap[T]["input"] extends never
    ? []
    : [InvokeCommandMap[T]["input"]]
) {
  const { invoke: _invoke } = await import("@tauri-apps/api/tauri")
  return _invoke<InvokeCommandMap[T]["output"]>(cmd, args)
}
