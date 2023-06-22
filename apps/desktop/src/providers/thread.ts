"use client"

import { nanoid } from "nanoid"
import { createProvider } from "puro"
import { useCallback, useContext, useMemo, useRef, useState } from "react"

import { createFileConfigStore } from "~features/inference-server/file-config-store"
import { InvokeCommand } from "~features/invoke"
import type { CompletionRequest, ThreadConfig } from "~features/invoke/thread"
import type { FileInfo } from "~features/model-downloader/model-file"
import {
  DEFAULT_THREAD_CONFIG,
  Role,
  type ThreadMessage
} from "~features/thread/_shared"
import { processSseStream } from "~features/thread/process-sse-stream"
import { useThreadMdx } from "~features/thread/use-thread-mdx"
import { useGlobal } from "~providers/global"

function applyTemplate(config: ThreadConfig, userPrompt: string) {
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
    activeModelState: [activeModel],
    modelsDirectoryState: { models, modelsMap },
    portState: [port],
    loadModel
  } = useGlobal()

  const [isResponding, setIsResponding] = useState(false)

  const threadConfig = useThreadConfig(thread, DEFAULT_THREAD_CONFIG)

  const threadModel = useMemo(() => {
    const savedPath = threadConfig.data?.modelPath
    if (!!savedPath && modelsMap.path.has(savedPath)) {
      return modelsMap.path.get(savedPath)
    } else {
      return models[0]
    }
  }, [threadConfig.data, models, modelsMap])

  const { messages, setMessages, appendMessage, botIconIndex } =
    useThreadMdx(thread)

  const aiMessageRef = useRef<ThreadMessage>()
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
    setIsResponding(true)
    const newMessage: ThreadMessage = {
      id: nanoid(),
      role: Role.Note,
      content: text
    }

    setMessages((m) => [newMessage, ...m])

    await appendMessage(newMessage)
    setIsResponding(false)
  }

  const stopInference = () => {
    abortRef.current = true
  }

  const startInference = async (userPrompt: string) => {
    if (isResponding) {
      return
    }

    const newMessages: ThreadMessage[] = [
      {
        id: nanoid(),
        role: Role.User,
        content: userPrompt
      },
      ...messages
    ]

    setMessages(newMessages)
    setIsResponding(true)

    await appendMessage(newMessages[0])

    try {
      const loadedModel =
        !activeModel || activeModel.path !== threadModel.path
          ? await loadModel(threadModel) // load the saved model in config if differ or load the most used model in the list
          : activeModel

      aiMessageRef.current = {
        id: nanoid(),
        role: Role.Bot,
        model: loadedModel.name,
        digest: loadedModel.digest,
        content: ""
      }

      const fetchStream = await globalThis.fetch(
        `http://localhost:${port}/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...threadConfig.data.completionParams,
            stream: true,
            prompt: applyTemplate(threadConfig.data, userPrompt)
          })
        }
      )

      if (fetchStream.status !== 200) {
        throw new Error(`Server responded with ${fetchStream.status}`)
      }

      await processSseStream(
        fetchStream,
        abortRef,
        async function onData(resp) {
          aiMessageRef.current.content += resp.choices[0].text
          setMessages([aiMessageRef.current, ...newMessages])
        },
        async function onFinish() {
          abortRef.current = false
          await appendMessage(
            aiMessageRef.current,
            threadConfig.data,
            loadedModel
          )
          setIsResponding(false)
        }
      )
    } catch (error) {
      alert(`ERROR: Server was not started OR no model was loaded | ${error}`)
      setIsResponding(false)
    }
  }

  return {
    messages,
    isResponding,
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
