import { nanoid } from "nanoid"
import { useRef, useState } from "react"
import dedent from "ts-dedent"

import { Role, type ThreadMessage } from "~features/thread/_shared"
import { processSseStream } from "~features/thread/process-sse-stream"
import { useThreadMdx } from "~features/thread/use-thread-mdx"
import { useGlobal } from "~providers/global"

const DEFAULT_PROMPT_TEMPLATE = dedent`
  ASSISTANT: {system}
  USER: {prompt}
  ASSISTANT:
`

function applyTemplate(
  promptTemplate: string,
  systemPrompt: string,
  userPrompt: string
) {
  return promptTemplate
    .replace("{system}", systemPrompt)
    .replace("{prompt}", userPrompt)
}

export const useActiveThread = () => {
  const {
    activeModelState: [activeModel],
    portState: [port]
  } = useGlobal()

  const [isResponding, setIsResponding] = useState(false)

  const {
    messages,
    setMessages,
    systemPrompt,
    setSystemPrompt,
    appendMessage,
    botIconIndex
  } = useThreadMdx()

  const [promptTemplate, setPrompTemplate] = useState(DEFAULT_PROMPT_TEMPLATE)

  const [maxTokens, setMaxTokens] = useState(4200)
  const [temperature, setTemperature] = useState(0)
  const [topP, setTopP] = useState(1)

  const aiMessageRef = useRef<ThreadMessage>()
  const abortRef = useRef(false)

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
            prompt: applyTemplate(promptTemplate, systemPrompt, userPrompt),
            max_tokens: maxTokens,
            temperature,
            stream: true
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

    promptTemplate,
    setPrompTemplate,

    addNote,
    startInference,
    stopInference,
    systemPrompt,
    setSystemPrompt
  }
}
