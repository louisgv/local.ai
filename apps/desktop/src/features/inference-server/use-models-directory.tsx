import { useCallback, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import type {
  DirectoryState,
  ModelMetadata
} from "~features/model-downloader/model-file"

export const useModelsDirectory = () => {
  const [modelsDirectory, setModelsDirectory] = useState("")
  const [models, setModels] = useState<ModelMetadata[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useInit(async () => {
    // get the models directory saved in config
    const { invoke } = await import("@tauri-apps/api/tauri")
    const resp = await invoke<DirectoryState>("initialize_models_dir")
    if (!resp) {
      return
    }
    setModelsDirectory(resp.path)
    setModels(resp.files)
  })

  const updateModelsDirectory = useCallback(
    async (dir = modelsDirectory) => {
      setIsRefreshing(true)
      const { invoke } = await import("@tauri-apps/api/tauri")
      const resp = await invoke<DirectoryState>("update_models_dir", {
        dir
      })
      setModelsDirectory(resp.path)
      setModels(resp.files)
      setIsRefreshing(false)
    },
    [modelsDirectory]
  )

  return {
    models,
    modelsDirectory,
    isRefreshing,
    updateModelsDirectory
  }
}
