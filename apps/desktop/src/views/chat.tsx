import { Input } from "@localai/ui/input"
import {
  BasketballAlt,
  BookStack,
  BreadSlice,
  CoffeeCup,
  Cpu,
  ElectronicsChip,
  ElectronicsTransistor,
  EmojiLookDown,
  FavouriteBook,
  Palette
} from "iconoir-react"
import { useRef, useState } from "react"

import { ViewBody, ViewContainer, ViewHeader } from "~features/layout/view"
import { MessageBlock } from "~features/thread/message-block"
import { PromptTextarea } from "~features/thread/prompt-textarea"
import { useGlobal } from "~providers/global"

type ChatMessage = {
  id: string
  content: string
  role: "user" | "bot"
}

type StreamResponse = {
  choices: {
    text: string
  }[]
}

const SSE_DATA_EVENT_PREFIX = "data:"

const DEFAULT_SYSTEM_PROMPT =
  "Greeting! I am a friendly AI assistant. Feel free to ask me anything."

const getQAPrompt = (text: string, systemPrompt: string) =>
  [`ASSISTANT: ${systemPrompt}`, `USER: ${text}`, `ASSISTANT: `].join("\n")

const botIconList = [
  BreadSlice,
  CoffeeCup,
  EmojiLookDown,
  ElectronicsTransistor,
  ElectronicsChip,
  Cpu,
  Palette,
  FavouriteBook,
  BasketballAlt
]

export const ChatView = () => {
  const {
    portState: [port]
  } = useGlobal()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isResponding, setIsResponding] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)

  const botIconRef = useRef(
    botIconList[Math.floor(Math.random() * botIconList.length)]
  )

  return (
    <ViewContainer>
      <ViewHeader>
        <Input
          className="w-full"
          placeholder="System Prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
      </ViewHeader>
      <ViewBody className="p-4 pr-0 flex flex-col gap-6 overflow-hidden">
        <ViewBody className="p-4 pl-0 flex flex-col-reverse gap-4 h-full overflow-auto">
          {messages.map((message) => (
            <MessageBlock
              from={message.role}
              BotIcon={botIconRef.current}
              key={message.id}>
              {message.content}
            </MessageBlock>
          ))}
        </ViewBody>

        <PromptTextarea
          className="sticky bottom-0 pr-4"
          disabled={isResponding}
          clearInput
          onSubmit={async (text) => {
            const newMessages: ChatMessage[] = [
              {
                id: Math.random().toString(),
                role: "user",
                content: text
              },
              ...messages
            ]
            setMessages(newMessages)
            setIsResponding(true)
            const aiMessage: ChatMessage = {
              id: Math.random().toString(),
              role: "bot",
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
                  prompt: getQAPrompt(text, systemPrompt),
                  max_tokens: 4200,
                  temperature: 0.9,
                  stream: true
                })
              }
            )
            const reader = fetchStream.body.getReader()
            const decoder = new TextDecoder("utf-8")

            reader.read().then(function processToken({ done, value }) {
              // Result objects contain two properties:
              // done  - true if the stream has already given you all its data.
              // value - some data. Always undefined when done is true.
              if (done) {
                setIsResponding(false)
                return
              }

              const result =
                typeof value === "string"
                  ? value
                  : decoder.decode(value, { stream: true })

              if (!!result && result.startsWith(SSE_DATA_EVENT_PREFIX)) {
                const eventData = result
                  .slice(SSE_DATA_EVENT_PREFIX.length)
                  .trim()

                const resp = JSON.parse(eventData) as StreamResponse
                // pick the first for now
                aiMessage.content += resp.choices[0].text
                setMessages([aiMessage, ...newMessages])
              }

              // Read some more, and call this function again
              return reader.read().then(processToken)
            })
          }}
        />
      </ViewBody>
    </ViewContainer>
  )
}
