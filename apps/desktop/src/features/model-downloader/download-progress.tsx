import { Button } from "@localai/ui/button"
import { CheckIcon, PauseIcon, PlayIcon } from "@radix-ui/react-icons"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import type { ModelMetadata } from "~features/model-downloader/model-file"

enum DownloadState {
  Idle = "idle",
  Downloading = "downloading",
  Completed = "completed"
}

type ProgressData = {
  progress: number
  downloadState: DownloadState
}

export const DownloadProgress = ({ model }: { model: ModelMetadata }) => {
  const [progress, setProgress] = useState(0)
  const [downloadState, setDownloadState] = useState<DownloadState>(
    DownloadState.Idle
  )

  useInit(async () => {
    const resp = await invoke<ProgressData>("get_download_progress", {
      path: model.path
    }).catch<null>(() => null)

    if (!resp) {
      return
    }

    setProgress(resp.progress)
    setDownloadState(resp.downloadState)
  }, [model])

  useEffect(() => {
    if (downloadState !== DownloadState.Downloading) {
      return
    }
    let unlisten: () => void
    async function updateProgress() {
      const { appWindow } = await import("@tauri-apps/api/window")

      unlisten = await appWindow.listen<ProgressData>(
        `download_progress:${model.path}`,
        (event) => {
          setProgress(event.payload.progress)
          if (event.payload.downloadState !== DownloadState.Downloading) {
            unlisten?.()
          }
        }
      )
    }
    updateProgress()
    return () => {
      unlisten?.()
    }
  }, [downloadState, model.path])

  const resumeDownload = async () => {
    await invoke<ProgressData>("resume_download", {
      path: model.path
    })
    setDownloadState(DownloadState.Downloading)
  }

  const pauseDownload = async () => {
    await invoke<ProgressData>("pause_download", {
      path: model.path
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {downloadState === DownloadState.Completed && <CheckIcon />}
      {downloadState === DownloadState.Downloading && (
        <Button onClick={() => pauseDownload()}>
          <PauseIcon />
        </Button>
      )}

      {downloadState === DownloadState.Idle && (
        <Button onClick={() => resumeDownload()}>
          <PlayIcon />
        </Button>
      )}

      <progress className="w-96" value={progress} max={100} />
    </div>
  )
}
