import type { InvokeCommand, InvokeIO } from "~features/invoke/_shared"
import type { DirectoryState } from "~features/model-downloader/model-file"

export type ThreadCommandMap = {
  [InvokeCommand.AppendThreadContent]: InvokeIO<
    {
      path: string
      content: string
    },
    string
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
    string
  >
  [InvokeCommand.CreateThreadFile]: InvokeIO<never, string>
}
