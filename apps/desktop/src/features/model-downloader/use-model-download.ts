import { invoke } from "@tauri-apps/api/tauri"
import { useCallback, useEffect, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import type { ModelMetadata } from "~features/model-downloader/model-file"

export enum DownloadState {
  None = "none",
  Idle = "idle",
  Downloading = "downloading",
  Completed = "completed"
}

type ProgressData = {
  eventId: string
  progress: number
  size: number
  downloadState: DownloadState
}

export const useModelDownload = (model: ModelMetadata) => {
  const [progress, setProgress] = useState(0)
  const [downloadState, setDownloadState] = useState<DownloadState>(
    DownloadState.None
  )
  const [eventId, setEventId] = useState<string | null>(null)

  const [modelSize, setModelSize] = useState(model.size)

  const syncDownloadState = async () => {
    const resp = await invoke<ProgressData>("get_download_progress", {
      path: model.path
    }).catch<null>((_) => null)

    if (!resp) {
      return
    }

    setEventId(resp.eventId)
    setProgress(resp.progress)
    setModelSize(resp.size)
    setDownloadState(resp.downloadState)
    return resp
  }

  useInit(async () => {
    await syncDownloadState()
  }, [model])

  useEffect(() => {
    if (downloadState !== DownloadState.Downloading || !eventId) {
      return
    }
    let unlisten: () => void
    async function updateProgress() {
      const { appWindow } = await import("@tauri-apps/api/window")
      unlisten = await appWindow.listen<ProgressData>(
        eventId,
        ({ payload }) => {
          setProgress(payload.progress)
          setModelSize(payload.size)

          if (payload.downloadState !== DownloadState.Downloading) {
            setDownloadState(payload.downloadState)
            unlisten?.()
          }
        }
      )
    }
    updateProgress()
    return () => {
      unlisten?.()
    }
  }, [downloadState, model.path, eventId])

  const resumeDownload = async () => {
    await invoke<ProgressData>("resume_download", {
      path: model.path
    })
    setDownloadState(DownloadState.Downloading)
    // const t = await syncDownloadState()
    // alert(JSON.stringify(t))
  }

  const pauseDownload = async () => {
    await invoke<ProgressData>("pause_download", {
      path: model.path
    })
    await syncDownloadState()
  }

  return {
    progress,
    downloadState,
    modelSize,
    resumeDownload,
    pauseDownload
  }
}
