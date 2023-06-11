import type { ModelInfo } from "@models/_shared"

import type { InvokeCommand, InvokeIO } from "~features/invoke/_shared"

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

export type ModelDownloaderCommandMap = {
  [InvokeCommand.StartDownload]: InvokeIO<
    Pick<ModelInfo, "name" | "downloadUrl" | "modelType"> & {
      digest: string
    }
  >
  [InvokeCommand.GetDownloadProgress]: InvokeIO<{ path: string }, ProgressData>
  [InvokeCommand.PauseDownload]: InvokeIO<{ path: string }, ProgressData>
  [InvokeCommand.ResumeDownload]: InvokeIO<{ path: string }, ProgressData>
}
