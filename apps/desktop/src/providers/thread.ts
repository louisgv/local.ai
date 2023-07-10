"use client"

import { processSseStream } from "@local.ai/sdk/sse"
import { createProvider } from "puro"
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import { wait } from "@plasmo/utils/wait"

import { createFileConfigStore } from "~features/inference-server/file-config-store"
import { InvokeCommand } from "~features/invoke"
import type { CompletionRequest, ThreadConfig } from "~features/invoke/thread"
import type { FileInfo } from "~features/model-downloader/model-file"
import { DEFAULT_THREAD_CONFIG, Role } from "~features/thread/_shared"
import { useHybrid } from "~features/thread/use-hybrid"
import { createMessage, useThreadMdx } from "~features/thread/use-thread-mdx"
import { useGlobal } from "~providers/global"

interface StreamResponse {
  choices: Array<{ text: string }>
}

function applyTemplate(config: ThreadConfig, userPrompt: string) {
  // Create history from previous convo

  return config.promptTemplate
    .replace("{system}", config.systemMessage)
    .replace("{prompt}", userPrompt)
}

const useThreadConfig = createFileConfigStore<ThreadConfig>(
  InvokeCommand.GetThreadConfig,
  InvokeCommand.SetThreadConfig
)

/**
 * Requires a global provider
 */
const useThreadProvider = ({ thread }: { thread: FileInfo }) => {
  const {
    routeState: [activeRoute],
    activeThreadState: [activeThread],
    activeModelState: [activeModel],
    modelsDirectoryState: { models, modelsMap },
    serverConfig,
    loadModel
  } = useGlobal()

  const isResponding = useHybrid(false)

  const threadConfig = useThreadConfig(thread, DEFAULT_THREAD_CONFIG)

  const threadModel = useMemo(() => {
    const savedPath = threadConfig.data?.modelPath
    if (!!savedPath && modelsMap.path.has(savedPath)) {
      return modelsMap.path.get(savedPath)
    } else {
      return models[0]
    }
  }, [threadConfig.data, models, modelsMap])

  const { messages, dispatch, appendMessage, botIconIndex } =
    useThreadMdx(thread)

  const [statusMessage, setStatusMessage] = useState("")

  const abortRef = useRef(false)

  const setCompletionParams = useCallback(
    (params: Partial<CompletionRequest>) => {
      threadConfig.update({
        completionParams: {
          ...threadConfig.data.completionParams,
          ...params
        }
      })
    },
    [threadConfig]
  )

  const addNote = async (text: string) => {
    const newMessage = createMessage(Role.Note, text)

    dispatch({
      type: "add",
      payload: newMessage
    })

    await appendMessage(newMessage)
  }

  const stopInference = () => {
    abortRef.current = true
  }

  const startInference = async (userPrompt: string) => {
    if (isResponding.data) {
      return
    }

    const sanitizedPrompt = userPrompt.trim()

    const promptMessage = createMessage(Role.User, sanitizedPrompt)

    dispatch({
      type: "add",
      payload: promptMessage
    })

    isResponding.set(true)

    await appendMessage(promptMessage)

    try {
      const loadedModel =
        !activeModel || activeModel.path !== threadModel.path
          ? await loadModel(threadModel) // load the saved model in config if differ or load the most used model in the list
          : activeModel

      const aiMessage = createMessage(Role.Bot, "", {
        model: loadedModel.name,
        digest: loadedModel.digest
      })

      dispatch({
        type: "add",
        payload: aiMessage
      })

      const fetchStream = await globalThis.fetch(
        `http://localhost:${serverConfig.data.port}/completions`,
        {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...threadConfig.data.completionParams,
            stream: true,
            prompt: applyTemplate(threadConfig.data, sanitizedPrompt)
          })
        }
      )

      if (fetchStream.status !== 200) {
        throw new Error(`Server responded with ${fetchStream.status}`)
      }

      await processSseStream(
        fetchStream,
        {
          async onComment(comment) {
            setStatusMessage(comment)
            await wait(42)
          },
          async onData(data) {
            const resp = JSON.parse(data) as StreamResponse
            aiMessage.content += resp.choices[0].text
            dispatch({
              type: "update",
              payload: aiMessage
            })
          },
          async onFinish() {
            abortRef.current = false
            setStatusMessage("")
            await appendMessage(aiMessage, threadConfig.data, loadedModel)
            isResponding.set(false)
          }
        },
        abortRef
      )
    } catch (error) {
      alert(`ERROR: Server was not started OR no model was loaded | ${error}`)
      isResponding.set(false)
    }
  }

  useEffect(() => {
    if (isResponding.ref.current) {
      abortRef.current = true
    }
  }, [activeThread.path, activeRoute, isResponding.ref])

  return {
    messages,

    statusMessage,
    isResponding: isResponding.render,

    botIconIndex,

    threadModel,
    threadConfig,
    setCompletionParams,

    addNote,
    startInference,
    stopInference
  }
}

const { BaseContext, Provider } = createProvider(useThreadProvider)

export const useThread = () => useContext(BaseContext)
export const ThreadProvider = Provider
