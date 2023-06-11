import { useCallback, useMemo, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import { InvokeCommand, invoke } from "~features/invoke"
import type { ModelMetadata } from "~features/model-downloader/model-file"

export const useModelsDirectory = () => {
  const [modelsDirectory, setModelsDirectory] = useState("")
  const [models, setModels] = useState<ModelMetadata[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useInit(async () => {
    // get the models directory saved in config
    const resp = await invoke(InvokeCommand.InitializeModelsDir)
    if (!resp) {
      return
    }
    setModelsDirectory(resp.path)
    setModels(resp.files)
  })

  const updateModelsDirectory = useCallback(
    async (dir = modelsDirectory) => {
      setIsRefreshing(true)
      const resp = await invoke(InvokeCommand.UpdateModelsDir, {
        dir
      })
      setModelsDirectory(resp.path)
      setModels(resp.files)
      setIsRefreshing(false)
    },
    [modelsDirectory]
  )

  // For shallow check of downloaded models - it will do for now. In the future, we would wanna check their hash
  const modelsMap = useMemo(
    () =>
      models.reduce((acc, model) => {
        acc.set(model.name, model)
        return acc
      }, new Map<string, ModelMetadata>()),
    [models]
  )

  return {
    models,
    modelsMap,
    modelsDirectory,
    isRefreshing,
    updateModelsDirectory
  }
}
