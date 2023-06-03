"use client"

import { invoke } from "@tauri-apps/api/tauri"
import { createProvider } from "puro"
import { useContext, useEffect, useState } from "react"

import { getCachedIntegrity } from "~features/inference-server/model-digest"
import { useModelStats } from "~features/inference-server/use-model-stats"
import { useModelType } from "~features/inference-server/use-model-type"
import type { ModelMetadata } from "~features/model-downloader/model-file"
import { useModelDownload } from "~features/model-downloader/use-model-download"
import { useGlobal } from "~providers/global"

export enum ModelLoadState {
  Default,
  Loading,
  Loaded
}
/**
 * Requires a global provider
 */
const useModelProvider = ({ model }: { model: ModelMetadata }) => {
  const {
    activeModelState: [activeModel, setActiveModel],
    concurrencyState: [concurrency]
  } = useGlobal()
  // TODO: Cache the model type in a kv later
  const [modelLoadState, setModelLoadState] = useState<ModelLoadState>(
    ModelLoadState.Default
  )

  const { modelType, updateModelType } = useModelType(model)

  const { downloadState, pauseDownload, progress, resumeDownload, modelSize } =
    useModelDownload(model)

  const { launchCount, incrementLaunchCount } = useModelStats(model)

  useEffect(() => {
    if (activeModel?.path !== model.path) {
      setModelLoadState(ModelLoadState.Default)
    } else {
      setModelLoadState(ModelLoadState.Loaded)
    }
  }, [activeModel, model])

  const loadModel = async () => {
    setModelLoadState(ModelLoadState.Loading)
    try {
      await invoke("load_model", {
        ...model,
        modelType,
        modelVocabulary: {},
        concurrency
      })

      const integrity = await getCachedIntegrity(model.path)

      setActiveModel({
        ...model,
        digest: integrity?.blake3
      })
      setModelLoadState(ModelLoadState.Loaded)
    } catch (error) {
      alert(error)
      setModelLoadState(ModelLoadState.Default)
    }
  }

  return {
    model,
    modelSize,
    modelLoadState,
    modelType,
    updateModelType,
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

export const useModel = () => useContext(BaseContext)
export const ModelProvider = Provider
