import type { InvokeCommand, InvokeIO } from "~features/invoke/_shared"
import type { DirectoryState } from "~features/model-downloader/model-file"

export type ModelsDirectoryCommandMap = {
  [InvokeCommand.InitializeModelsDir]: InvokeIO<never, DirectoryState>
  [InvokeCommand.UpdateModelsDir]: InvokeIO<{ dir: string }, DirectoryState>
  [InvokeCommand.DeleteModelFile]: InvokeIO<{ path: string }>
}
