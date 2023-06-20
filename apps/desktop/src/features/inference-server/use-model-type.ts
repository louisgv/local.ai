import { ModelType } from "@models/index"
import { useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import { InvokeCommand, invoke } from "~features/invoke"
import type { ModelMetadata } from "~features/model-downloader/model-file"

export const useModelType = (model: ModelMetadata) => {
  const [modelType, _setModelType] = useState<ModelType>(ModelType.Llama)

  useInit(async () => {
    try {
      const resp = await invoke(InvokeCommand.GetModelType, {
        path: model.path
      })

      _setModelType(resp)
    } catch (_) {}
  }, [model])

  const updateModelType = async (newModelType: ModelType) => {
    _setModelType(newModelType)
    await invoke(InvokeCommand.SetModelType, {
      path: model.path,
      modelType: newModelType
    })
  }
  return {
    data: modelType,
    update: updateModelType
  }
}
