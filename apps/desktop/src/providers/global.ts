"use client"

import { createProvider } from "puro"
import { useContext, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import { useModelsDirectory } from "~features/inference-server/use-models-directory"
import { type ModelMetadata } from "~features/model-downloader/model-file"

export enum Route {
  ModelManager = "model-manager",
  Chat = "chat"
}

const useGlobalProvider = () => {
  const routeState = useState<Route>(Route.ModelManager)

  const activeModelState = useState<ModelMetadata>(null)
  const concurrencyState = useState(1)
  const activeChatState = useState(0)
  const chatListState = useState([])

  const portState = useState(8000)

  const serverStartedState = useState(false)

  const modelsDirectoryState = useModelsDirectory()

  useInit(async () => {
    const { getCurrent } = await import("@tauri-apps/api/window")
    const currentWindow = getCurrent()
    const isVisible = await currentWindow.isVisible()
    if (!isVisible) {
      await currentWindow.center()
      await currentWindow.show()
    }
  })

  return {
    portState,
    routeState,
    activeChatState,
    chatListState,
    activeModelState,
    concurrencyState,
    serverStartedState,
    modelsDirectoryState
  }
}

const { BaseContext, Provider } = createProvider(useGlobalProvider)

export const useGlobal = () => useContext(BaseContext)
export const GlobalProvider = Provider
