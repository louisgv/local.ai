import type { InvokeCommand, InvokeIO } from "~features/invoke/_shared"

export type ServerConfig = {
  port: number
  concurrency: number
  useGpu: boolean
}

export type ServerCommandMap = {
  [InvokeCommand.StartServer]: InvokeIO<{ port: number }, string>
  [InvokeCommand.StopServer]: InvokeIO<never, string>

  [InvokeCommand.GetServerConfig]: InvokeIO<{ path: string }, ServerConfig>
  [InvokeCommand.SetServerConfig]: InvokeIO<{
    path: string
    config: ServerConfig
  }>
}
