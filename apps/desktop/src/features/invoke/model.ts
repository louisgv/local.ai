import type { ModelInfo, ModelType } from "@models/_shared"

import type { InvokeCommand, InvokeIO } from "~features/invoke/_shared"
import type { DirectoryState } from "~features/model-downloader/model-file"

export enum DownloadState {
  None = "none",
  Idle = "idle",
  Downloading = "downloading",
  Validating = "validating",
  Completed = "completed",
  Errored = "errored"
}

export type ProgressData = {
  eventId: string
  progress: number
  size: number
  downloadState: DownloadState

  digest?: String
  error?: string
}

type ModelDownloaderCommandMap = {
  [InvokeCommand.StartDownload]: InvokeIO<
    Pick<ModelInfo, "name" | "downloadUrl"> & {
      digest: string
    },
    string
  >
  [InvokeCommand.GetDownloadProgress]: InvokeIO<{ path: string }, ProgressData>
  [InvokeCommand.PauseDownload]: InvokeIO<{ path: string }, ProgressData>
  [InvokeCommand.ResumeDownload]: InvokeIO<{ path: string }, ProgressData>
}

type ModelsDirectoryCommandMap = {
  [InvokeCommand.InitializeModelsDir]: InvokeIO<never, DirectoryState>
  [InvokeCommand.UpdateModelsDir]: InvokeIO<{ dir: string }, DirectoryState>
  [InvokeCommand.DeleteModelFile]: InvokeIO<{ path: string }>
}

export type ModelStats = {
  loadCount: number
}

type ModelStatsCommandMap = {
  [InvokeCommand.GetModelStats]: InvokeIO<{ path: string }, ModelStats>
}

export type ModelIntegrity = {
  sha256: string
  blake3: string
}

type ModelIntegrityCommandMap = {
  [InvokeCommand.GetCachedIntegrity]: InvokeIO<{ path: string }, ModelIntegrity>
  [InvokeCommand.ComputeModelIntegrity]: InvokeIO<
    { path: string },
    ModelIntegrity
  >
}

export type ModelConfig = {
  modelType: ModelType
  tokenizer: string
  defaultPromptTemplate: string
}

type ModelConfigCommandMap = {
  [InvokeCommand.GetModelConfig]: InvokeIO<{ path: string }, ModelConfig>
  [InvokeCommand.SetModelConfig]: InvokeIO<{
    path: string
    config: ModelConfig
  }>
}

export type ModelCommandMap = ModelsDirectoryCommandMap &
  ModelDownloaderCommandMap &
  ModelStatsCommandMap &
  ModelIntegrityCommandMap &
  ModelConfigCommandMap
