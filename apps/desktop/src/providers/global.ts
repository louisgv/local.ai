"use client"

import { createProvider } from "puro"
import { useContext, useState } from "react"

import { type ModelMetadata } from "~core/model-file"
import { useInit } from "~features/inference-server/use-init"

const useGlobalProvider = () => {
  const activeModelState = useState<ModelMetadata>(null)
  const concurrencyState = useState(1)

  const activeChatState = useState(0)
  const chatListState = useState([])

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
    activeChatState,
    chatListState,
    activeModelState,
    concurrencyState
  }
}

const { BaseContext, Provider } = createProvider(useGlobalProvider)

export const useGlobal = () => useContext(BaseContext)
export const GlobalProvider = Provider
