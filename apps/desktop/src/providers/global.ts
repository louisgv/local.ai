"use client"

import type { WebviewWindow } from "@tauri-apps/api/window"
import { createProvider } from "puro"
import { useEffect, useRef } from "react"
import { useContext, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import { useModelsDirectory } from "~features/inference-server/use-models-directory"
import { InvokeCommand, invoke } from "~features/invoke"
import { useToggle } from "~features/layout/use-toggle"
import type {
  FileInfo,
  ModelMetadata
} from "~features/model-downloader/model-file"
import { useModelsApi } from "~features/model-downloader/use-models-api"
import { useThreadsDirectory } from "~features/thread/use-threads-directory"
import { getCachedIntegrity } from "~providers/model"

export enum Route {
  ModelManager = "model-manager",
  Thread = "thread"
}

let _prefix: string
let _window: WebviewWindow

async function setTitle(title = "") {
  if (_prefix === undefined) {
    const { platform } = await import("@tauri-apps/api/os")
    const currentPlatform = await platform()
    _prefix = currentPlatform === "win32" ? "" : "🎒 "
  }
  let window = _window
  if (!window) {
    const { getCurrent } = await import("@tauri-apps/api/window")
    window = getCurrent()
  }
  const suffix = `${title ? ` - ` : ""}local.ai`

  await window.setTitle(`${_prefix}${title}${suffix}`)
}

const useGlobalProvider = () => {
  const routeState = useState<Route>(Route.ModelManager)

  const activeModelState = useState<ModelMetadata>(null)
  const concurrencyState = useState(1)
  const activeThreadState = useState<FileInfo>()

  const portState = useState(8000)

  const serverStartedState = useState(false)
  const sidebarState = useToggle(true)
  const threadViewConfigPanelState = useToggle(false)

  const modelsDirectoryState = useModelsDirectory()
  const threadsDirectoryState = useThreadsDirectory()

  const onboardState = useState("")

  const windowRef = useRef<WebviewWindow>()

  const knownModels = useModelsApi()

  useInit(async () => {
    const { getCurrent } = await import("@tauri-apps/api/window")
    const currentWindow = getCurrent()
    windowRef.current = currentWindow
    _window = currentWindow

    const [isVisible, initialOnboardState] = await Promise.all([
      currentWindow.isVisible(),
      invoke(InvokeCommand.GetConfig, {
        key: "onboard_state"
      }).catch<null>((_) => null),
      setTitle()
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

  const loadModel = async (model: ModelMetadata) => {
    await invoke(InvokeCommand.LoadModel, {
      ...model,
      concurrency: concurrencyState[0]
    })

    const integrity = await getCachedIntegrity(model)

    activeModelState[1]({
      ...model,
      digest: integrity?.blake3
    })

    if (!serverStartedState[0]) {
      await startServer()
    }
  }

  useEffect(() => {
    if (routeState[0] === Route.ModelManager) {
      setTitle("Model Manager")
    } else if (activeThreadState[0]) {
      setTitle(activeThreadState[0].name.slice(0, -2))
    }
  }, [activeThreadState[0], routeState[0]])

  return {
    getWindow: () => windowRef.current,
    loadModel,
    startServer,
    stopServer,

    knownModels,

    portState,
    routeState,
    activeThreadState,
    activeModelState,
    concurrencyState,
    serverStartedState,
    sidebarState,
    modelsDirectoryState,
    threadsDirectoryState,
    threadViewConfigPanelState,
    onboardState
  }
}

const { BaseContext, Provider } = createProvider(useGlobalProvider)

export const useGlobal = () => useContext(BaseContext)
export const GlobalProvider = Provider
