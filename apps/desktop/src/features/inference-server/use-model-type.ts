import { ModelType } from "@models/index"
import { useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import { InvokeCommand, invoke } from "~features/invoke"
import type { ModelMetadata } from "~features/model-downloader/model-file"

export function setModelType(model: ModelMetadata, modelType: ModelType) {
  return invoke(InvokeCommand.SetModelType, {
    path: model.path,
    modelType
  })
}

export async function getModelType(model: ModelMetadata) {
  return invoke(InvokeCommand.GetModelType, {
    path: model.path
  }).catch<null>(() => null)
}

export const useModelType = (model: ModelMetadata) => {
  const [modelType, _setModelType] = useState<ModelType>(ModelType.Llama)

  useInit(async () => {
    const resp = await getModelType(model)

    if (!!resp) {
      _setModelType(resp)
    }
  }, [model])

  const updateModelType = async (newModelType: ModelType) => {
    _setModelType(newModelType)
    await setModelType(model, newModelType)
  }
  return {
    modelType,
    updateModelType
  }
}
