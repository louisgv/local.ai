import { useEffect, useState } from "react"

type ProgressData = {
  progress: number
  md5Hash: string
}

export const useDownloadProgress = () => {
  const [progressList, setProgressList] = useState<ProgressData[]>([])

  useEffect(() => {
    if (!window) {
      return
    }

    const progressMap = {}

    let unlisten: (() => void) | undefined
    async function startListen() {
      const { appWindow } = await import("@tauri-apps/api/window")
      unlisten = await appWindow.listen<ProgressData>(
        "download-progress",
        (event) => {
          progressMap[event.payload.md5Hash] = event.payload.progress
          setProgressList(Object.values(progressMap))
        }
      )
    }

    startListen()

    return () => {
      unlisten?.()
    }
  }, [])

  return {
    progressList
  }
}
