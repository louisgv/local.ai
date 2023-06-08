"use client"

import type { WebviewWindow } from "@tauri-apps/api/window"
import { createProvider } from "puro"
import { useRef } from "react"
import { useContext, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import { useModelsDirectory } from "~features/inference-server/use-models-directory"
import { useToggle } from "~features/layout/use-toggle"
import type { ModelMetadata } from "~features/model-downloader/model-file"
import { useThreadsDirectory } from "~features/thread/use-threads-directory"

export enum Route {
  ModelManager = "model-manager",
  Chat = "chat"
}

async function setTitle(window: WebviewWindow) {
  const { platform } = await import("@tauri-apps/api/os")

  const currentPlatform = await platform()
  const prefix = currentPlatform === "darwin" ? "🎒 " : ""

  await window.setTitle(`${prefix}local.ai`)
}

const useGlobalProvider = () => {
  const routeState = useState<Route>(Route.ModelManager)

  const activeModelState = useState<ModelMetadata>(null)
  const concurrencyState = useState(1)
  const activeThreadState = useState<string>()

  const portState = useState(8000)

  const serverStartedState = useState(false)
  const sidebarState = useToggle(true)

  const modelsDirectoryState = useModelsDirectory()
  const threadsDirectoryState = useThreadsDirectory()

  const onboardState = useState()

  const windowRef = useRef<WebviewWindow>()

  useInit(async () => {
    const [{ getCurrent }, { invoke }] = await Promise.all([
      import("@tauri-apps/api/window"),
      import("@tauri-apps/api/tauri")
    ])
    const currentWindow = getCurrent()
    windowRef.current = currentWindow

    const [isVisible, initialOnboardState] = await Promise.all([
      currentWindow.isVisible(),
      invoke<string>("get_config", {
        key: "onboard_state"
      }).catch((_) => null),
      setTitle(currentWindow)
    ])

    onboardState[1](initialOnboardState)

    if (!isVisible) {
      await currentWindow.center()
      await currentWindow.show()
    }
  })

  return {
    getWindow: () => windowRef.current,
    portState,
    routeState,
    activeThreadState,
    activeModelState,
    concurrencyState,
    serverStartedState,
    sidebarState,
    modelsDirectoryState,
    threadsDirectoryState,
    onboardState
  }
}

const { BaseContext, Provider } = createProvider(useGlobalProvider)

export const useGlobal = () => useContext(BaseContext)
export const GlobalProvider = Provider
