import { useEffect, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import { InvokeCommand, invoke } from "~features/invoke"
import { DownloadState, type ProgressData } from "~features/invoke/model"
import type { ModelMetadata } from "~features/model-downloader/model-file"
import { useGlobal } from "~providers/global"

export { DownloadState, type ProgressData }

export const useModelDownload = (model: ModelMetadata) => {
  const {
    modelsDirectoryState: { updateModelsDirectory }
  } = useGlobal()

  const [progress, setProgress] = useState(0)
  const [downloadState, setDownloadState] = useState<DownloadState>(
    DownloadState.None
  )
  const [eventId, setEventId] = useState<string | null>(null)

  const [modelSize, setModelSize] = useState(model.size)

  const syncDownloadState = async () => {
    const resp = await invoke(InvokeCommand.GetDownloadProgress, {
      path: model.path
    }).catch<null>((_) => null)

    if (!resp) {
      return
    }

    setEventId(resp.eventId)
    setProgress(resp.progress)
    setModelSize(resp.size)
    setDownloadState(resp.downloadState)
  }

  useInit(syncDownloadState, [model])

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

          if (
            payload.downloadState === DownloadState.Downloading ||
            payload.downloadState === DownloadState.Validating
          ) {
            return
          }

          if (payload.downloadState === DownloadState.Errored) {
            alert(payload.error)
          }

          setDownloadState(payload.downloadState)
          unlisten?.()
        }
      )
    }
    updateProgress()
    return () => {
      unlisten?.()
    }
  }, [downloadState, model.path, eventId, updateModelsDirectory])

  const resumeDownload = async () => {
    await invoke(InvokeCommand.ResumeDownload, {
      path: model.path
    })

    setDownloadState(DownloadState.Downloading)
  }

  const pauseDownload = async () => {
    setDownloadState(DownloadState.Validating)
    await invoke(InvokeCommand.PauseDownload, {
      path: model.path
    })
    setDownloadState(DownloadState.Idle)
  }

  return {
    progress,
    downloadState,
    modelSize,
    resumeDownload,
    pauseDownload
  }
}
