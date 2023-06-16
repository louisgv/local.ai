import { useCallback, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import { InvokeCommand, invoke } from "~features/invoke"
import type { ModelConfig } from "~features/invoke/model-config"
import type { ModelMetadata } from "~features/model-downloader/model-file"

export function setModelConfig(model: ModelMetadata, config: ModelConfig) {
  return invoke(InvokeCommand.SetModelConfig, {
    path: model.path,
    config
  })
}

export async function getModelConfig(model: ModelMetadata) {
  return invoke(InvokeCommand.GetModelConfig, {
    path: model.path
  }).catch<null>(() => null)
}

export const useModelConfig = (model: ModelMetadata) => {
  const [modelConfig, _setModelConfig] = useState<ModelConfig>()

  useInit(async () => {
    const resp = await getModelConfig(model)

    if (!!resp) {
      _setModelConfig(resp)
    }
  }, [model])

  const updateModelConfig = useCallback(
    async (config: Partial<ModelConfig>) => {
      _setModelConfig((cc) => ({
        ...cc,
        ...config
      }))

      await setModelConfig(model, {
        ...modelConfig,
        ...config
      })
    },
    [modelConfig]
  )

  return {
    modelConfig,
    updateModelConfig
  }
}
