"use client"

import { nanoid } from "nanoid"
import { createProvider } from "puro"
import { useContext, useRef, useState } from "react"

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
    portState: [port]
  } = useGlobal()

  const [isResponding, setIsResponding] = useState(false)

  const threadConfig = useThreadConfig(thread, DEFAULT_THREAD_CONFIG)

  const { messages, setMessages, appendMessage, botIconIndex } = useThreadMdx(
    thread,
    activeModel
  )

  const aiMessageRef = useRef<ThreadMessage>()
  const abortRef = useRef(false)

  const setCompletionParams = (params: Partial<CompletionRequest>) => {
    threadConfig.update({
      completionParams: {
        ...threadConfig.data.completionParams,
        ...params
      }
    })
  }

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

    aiMessageRef.current = {
      id: nanoid(),
      role: Role.Bot,
      model: activeModel.name,
      content: ""
    }

    try {
      const fetchStream = await globalThis.fetch(
        `http://localhost:${port}/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            stream: true,
            prompt: applyTemplate(threadConfig.data, userPrompt),
            ...threadConfig.data.completionParams
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
          await appendMessage(aiMessageRef.current)
          setIsResponding(false)
        }
      )
    } catch (error) {
      alert(`ERROR: Server was not started OR no model was loaded.`)
      setIsResponding(false)
    }
  }

  return {
    messages,
    isResponding,
    botIconIndex,

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
