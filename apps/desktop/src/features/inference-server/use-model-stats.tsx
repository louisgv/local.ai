import { invoke } from "@tauri-apps/api/tauri"
import { useReducer } from "react"

import { useInit } from "~features/inference-server/use-init"
import type { ModelMetadata } from "~features/model-downloader/model-file"

export type ModelStats = {
  loadCount: number
}

type LaunchCountAction = { type: "initialize" | "increment"; payload?: number }

function launchCounter(state: number, action: LaunchCountAction) {
  switch (action.type) {
    case "increment":
      return state + 1
    case "initialize":
    default:
      return action.payload || 0
  }
}

export const useModelStats = (model: ModelMetadata) => {
  const [launchCount, dispatch] = useReducer(launchCounter, 0)

  useInit(async () => {
    const resp = await invoke<ModelStats>("get_model_stats", {
      path: model.path
    }).catch<null>(() => null)
    if (resp) {
      dispatch({ type: "initialize", payload: resp.loadCount })
    }
  }, [model])

  return {
    launchCount,
    incrementLaunchCount: () => dispatch({ type: "increment" })
  }
}
