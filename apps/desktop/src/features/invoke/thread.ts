import type { InvokeCommand, InvokeIO } from "~features/invoke/_shared"
import type {
  DirectoryState,
  FileInfo
} from "~features/model-downloader/model-file"

export type CompletionRequest = {
  prompt: string

  seed?: number

  max_tokens?: number
  temperature?: number
  top_p?: number
  top_k?: number
  frequency_penalty?: number
  presence_penalty?: number

  stop?: string[]
}

export type ThreadConfig = {
  modelPath?: string
  tokenizer?: string
  promptTemplate?: string
  systemMessage?: string
  completionParams?: CompletionRequest
}

export type ThreadCommandMap = {
  [InvokeCommand.AppendThreadContent]: InvokeIO<
    {
      path: string
      content: string
    },
    void
  >
  [InvokeCommand.ReadThreadFile]: InvokeIO<{
    path: string
    eventId: string
  }>
  [InvokeCommand.InitializeThreadsDir]: InvokeIO<never, DirectoryState>
  [InvokeCommand.UpdateThreadsDir]: InvokeIO<{ dir: string }, DirectoryState>
  [InvokeCommand.DeleteThreadFile]: InvokeIO<{ path: string }>
  [InvokeCommand.RenameThreadFile]: InvokeIO<
    { path: string; newName: string },
    FileInfo
  >
  [InvokeCommand.CreateThreadFile]: InvokeIO<never, FileInfo>

  [InvokeCommand.GetThreadConfig]: InvokeIO<{ path: string }, ThreadConfig>
  [InvokeCommand.SetThreadConfig]: InvokeIO<
    { path: string; config: ThreadConfig },
    void
  >
  [InvokeCommand.CreateThreadFile]: InvokeIO<never, FileInfo>
}
