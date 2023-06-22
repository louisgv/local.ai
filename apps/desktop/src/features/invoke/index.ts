import type { ModelCommandMap } from "~features/invoke/model"
import type { ThreadCommandMap } from "~features/invoke/thread"

import { InvokeCommand, type InvokeIO } from "./_shared"

export { InvokeCommand }

type InvokeCommandMap = {
  [InvokeCommand.TestModel]: InvokeIO
  [InvokeCommand.LoadModel]: InvokeIO

  [InvokeCommand.OpenDirectory]: InvokeIO<{ path: string }>
  [InvokeCommand.GetConfig]: InvokeIO<{ key: string }, string>

  [InvokeCommand.StartServer]: InvokeIO<{ port: number }, string>
  [InvokeCommand.StopServer]: InvokeIO<never, string>
} & ThreadCommandMap &
  ModelCommandMap

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
