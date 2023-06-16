import type { InvokeCommand, InvokeIO } from "~features/invoke/_shared"

export type ModelConfig = {
  tokenizer: string
  defaultPromptTemplate: string
}

export type ModelConfigCommandMap = {
  [InvokeCommand.GetModelConfig]: InvokeIO<{ path: string }, ModelConfig>
  [InvokeCommand.SetModelConfig]: InvokeIO<{
    path: string
    config: ModelConfig
  }>
}
