import type { InvokeCommand, InvokeIO } from "~features/invoke/_shared"
import type {
  DirectoryState,
  FileInfo
} from "~features/model-downloader/model-file"

export type ThreadsDirectoryCommandMap = {
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
}
