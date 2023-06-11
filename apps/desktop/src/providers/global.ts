"use client"

import type { ModelType } from "@models/_shared"
import type { WebviewWindow } from "@tauri-apps/api/window"
import { createProvider } from "puro"
import { useRef } from "react"
import { useContext, useState } from "react"

import { getCachedIntegrity } from "~features/inference-server/model-digest"
import { useInit } from "~features/inference-server/use-init"
import { useModelsDirectory } from "~features/inference-server/use-models-directory"
import { InvokeCommand, invoke } from "~features/invoke"
import { useToggle } from "~features/layout/use-toggle"
import type { ModelMetadata } from "~features/model-downloader/model-file"
import { useThreadsDirectory } from "~features/thread/use-threads-directory"

export enum Route {
  ModelManager = "model-manager",
  Chat = "chat"
}

export async function invoke<T = any>(cmd: string, args?: Record<string, any>) {
  const { invoke: _invoke } = await import("@tauri-apps/api/tauri")
  return _invoke<T>(cmd, args)
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

  const onboardState = useState("")

  const windowRef = useRef<WebviewWindow>()

  useInit(async () => {
    const { getCurrent } = await import("@tauri-apps/api/window")
    const currentWindow = getCurrent()
    windowRef.current = currentWindow

    const [isVisible, initialOnboardState] = await Promise.all([
      currentWindow.isVisible(),
      invoke(InvokeCommand.GetConfig, {
        key: "onboard_state"
      }).catch<null>((_) => null),
      setTitle(currentWindow)
    ])

    onboardState[1](initialOnboardState)

    if (!isVisible) {
      await currentWindow.center()
      await currentWindow.show()
    }
  })

  const startServer = async () => {
    await invoke(InvokeCommand.StartServer, { port: portState[0] }).catch(
      (_) => null
    )
    serverStartedState[1](true)
  }

  const stopServer = async () => {
    await invoke(InvokeCommand.StopServer)
    serverStartedState[1](false)
  }

  const loadModel = async (
    model: ModelMetadata,
    modelType: ModelType,
    modelVocabulary = {}
  ) => {
    await invoke(InvokeCommand.LoadModel, {
      ...model,
      modelType,
      modelVocabulary,
      concurrency: concurrencyState[0]
    })

    const integrity = await getCachedIntegrity(model.path)

    activeModelState[1]({
      ...model,
      digest: integrity?.blake3
    })

    if (!serverStartedState[0]) {
      await startServer()
    }
  }

  const startServer = async () => {
    await invoke("start_server", { port: portState[0] }).catch((_) => null)
    serverStartedState[1](true)
  }

  const stopServer = async () => {
    await invoke("stop_server")
    serverStartedState[1](false)
  }

  return {
    getWindow: () => windowRef.current,
    loadModel,

    startServer,
    stopServer,

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
