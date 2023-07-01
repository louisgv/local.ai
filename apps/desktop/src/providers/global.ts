"use client"

import type { WebviewWindow } from "@tauri-apps/api/window"
import { createProvider } from "puro"
import { useEffect, useRef } from "react"
import { useContext, useState } from "react"

import { createFileConfigStore } from "~features/inference-server/file-config-store"
import { useInit } from "~features/inference-server/use-init"
import { useModelsDirectory } from "~features/inference-server/use-models-directory"
import { InvokeCommand, invoke } from "~features/invoke"
import type { ServerConfig } from "~features/invoke/server"
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

const useServerConfig = createFileConfigStore<ServerConfig>(
  InvokeCommand.GetServerConfig,
  InvokeCommand.SetServerConfig
)

const useGlobalProvider = () => {
  const [activeRoute, setActiveRoute] = useState<Route>(Route.ModelManager)

  const activeModelState = useState<ModelMetadata>(null)
  const [activeThread, setActiveThread] = useState<FileInfo>()

  const serverConfig = useServerConfig(
    { path: "june-2023" },
    {
      concurrency: 1,
      port: 8000,
      useGpu: false
    }
  )

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
    await invoke(InvokeCommand.StartServer, {
      port: serverConfig.data.port
    }).catch((_) => null)
    serverStartedState[1](true)
  }

  const stopServer = async () => {
    await invoke(InvokeCommand.StopServer)
    serverStartedState[1](false)
  }

  const loadModel = async (model: ModelMetadata) => {
    await invoke(InvokeCommand.LoadModel, {
      ...model,
      concurrency: serverConfig.data.concurrency,
      useGpu: serverConfig.data.useGpu
    })

    const integrity = await getCachedIntegrity(model)

    const loadedModel = {
      ...model,
      digest: integrity?.blake3
    }

    activeModelState[1](loadedModel)

    if (!serverStartedState[0]) {
      await startServer()
    }

    return loadedModel
  }

  useEffect(() => {
    if (activeRoute === Route.ModelManager) {
      setTitle("Model Manager")
    } else if (activeThread) {
      setTitle(activeThread.name.slice(0, -2))
    }
  }, [activeThread, activeRoute])

  return {
    getWindow: () => windowRef.current,
    loadModel,
    startServer,
    stopServer,

    knownModels,
    serverConfig,

    routeState: [activeRoute, setActiveRoute] as const,
    activeThreadState: [activeThread, setActiveThread] as const,
    activeModelState,

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
