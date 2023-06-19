"use client"

import { createProvider } from "puro"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import { useModelConfig } from "~features/inference-server/use-model-config"
import { useModelStats } from "~features/inference-server/use-model-stats"
import { useModelType } from "~features/inference-server/use-model-type"
import { InvokeCommand, invoke } from "~features/invoke"
import type { ModelIntegrity } from "~features/invoke/model-integrity"
import type { ModelMetadata } from "~features/model-downloader/model-file"
import {
  DownloadState,
  useModelDownload
} from "~features/model-downloader/use-model-download"
import { useGlobal } from "~providers/global"

export enum ModelLoadState {
  Default,
  Loading,
  Loaded
}

export const getCachedIntegrity = (model: ModelMetadata) =>
  invoke(InvokeCommand.GetCachedIntegrity, {
    path: model.path
  }).catch<ModelIntegrity>(() => null)
/**
 * Requires a global provider
 */
const useModelProvider = ({ model }: { model: ModelMetadata }) => {
  const {
    knownModels: { modelMap },
    activeModelState: [activeModel],
    loadModel: _loadModel
  } = useGlobal()
  // TODO: Cache the model type in a kv later
  const [modelLoadState, setModelLoadState] = useState<ModelLoadState>(
    ModelLoadState.Default
  )

  const [integrity, setIntegrity] = useState<ModelIntegrity>(null)
  const [isChecking, setIsChecking] = useState(false)

  const { modelType, updateModelType } = useModelType(model)

  const { modelConfig, updateModelConfig } = useModelConfig(model)

  const { downloadState, pauseDownload, progress, resumeDownload, modelSize } =
    useModelDownload(model)

  const { launchCount, incrementLaunchCount } = useModelStats(model)

  const knownModelInfo = useMemo(
    () => modelMap?.[integrity?.blake3],
    [integrity, modelMap]
  )

  useEffect(() => {
    if (activeModel?.path !== model.path) {
      setModelLoadState(ModelLoadState.Default)
    } else {
      setModelLoadState(ModelLoadState.Loaded)
    }
  }, [activeModel, model])

  const integrityInit = useInit(async () => {
    const resp = await getCachedIntegrity(model)
    setIntegrity(resp)
  }, [model])

  useEffect(() => {
    if (downloadState === DownloadState.Completed) {
      getCachedIntegrity(model).then(setIntegrity)
    }
  }, [model, downloadState])

  const loadModel = useCallback(async () => {
    setModelLoadState(ModelLoadState.Loading)
    try {
      await _loadModel(model)

      setModelLoadState(ModelLoadState.Loaded)
    } catch (error) {
      alert(error)
      setModelLoadState(ModelLoadState.Default)
    }
  }, [model])

  const checkModel = useCallback(async () => {
    setIntegrity(null)
    setIsChecking(true)
    try {
      const resp = await invoke(InvokeCommand.ComputeModelIntegrity, {
        path: model.path
      })
      setIntegrity(resp)

      const knownModelMetadata = modelMap[resp.blake3]
      if (!!knownModelMetadata) {
        alert(
          "Known model metadata found, updating model config:\n\n" +
            JSON.stringify(knownModelMetadata, null, 2)
        )
        updateModelType(knownModelMetadata.modelType)
        updateModelConfig({
          tokenizer: knownModelMetadata.tokenizers?.[0] || "", // Pick the first one for now
          defaultPromptTemplate: knownModelMetadata.promptTemplate || ""
        })
      } else {
        alert(
          "No known model metadata found. The model might need manual configuration."
        )
      }
    } catch (error) {
      alert(error)
    }
    setIsChecking(false)
  }, [model])

  return {
    model,
    knownModelInfo,
    integrityInit,
    integrity,
    isChecking,
    checkModel,
    modelSize,
    modelLoadState,
    modelType,
    updateModelType,
    modelConfig,
    updateModelConfig,
    loadModel,
    downloadState,
    progress,
    pauseDownload,
    resumeDownload,
    launchCount,
    incrementLaunchCount
  }
}

const { BaseContext, Provider } = createProvider(useModelProvider)

export const useServer = () => useContext(BaseContext)
export const ServerProvider = Provider
