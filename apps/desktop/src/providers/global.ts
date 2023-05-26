"use client"

import { createProvider } from "puro"
import { useContext, useState } from "react"

import { type ModelMetadata } from "~core/model-file"
import { useInit } from "~features/inference-server/use-init"

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

  const serverStartedState = useState(false)

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
    routeState,
    activeChatState,
    chatListState,
    activeModelState,
    concurrencyState,
    serverStartedState
  }
}

const { BaseContext, Provider } = createProvider(useGlobalProvider)

export const useGlobal = () => useContext(BaseContext)
export const GlobalProvider = Provider
