import { nanoid } from "nanoid"
import { useCallback, useEffect, useRef, useState } from "react"

import { useGlobal } from "~providers/global"

export enum Role {
  Metadata = "metadata",
  User = "user",
  Bot = "bot",
  Note = "note"
}

type ChatMessage = {
  id: string
  content: string
  role: Role
}

type StreamResponse = {
  choices: {
    text: string
  }[]
}

const SSE_DATA_EVENT_PREFIX = "data:"

const DEFAULT_SYSTEM_PROMPT =
  "Greeting! I am a friendly AI assistant. Feel free to ask me anything."

// TODO: Utilize a prompt template system instead
const getQAPrompt = (text: string, systemPrompt: string) =>
  [`ASSISTANT: ${systemPrompt}`, `USER: ${text}`, `ASSISTANT: `].join("\n")

type ThreadReadData = {
  line: string
  done: boolean
}

const userRegex = /<User id="(?<id>[^"]+)" \/>/u

const botRegex =
  /<Bot[\s\S]*id="(?<id>[^"]+)"(?:[\s\S]*system="(?<system>[^"]+)")?(?:[\s\S]*model="(?<model>[^"]+)")?(?:[\s\S]*digest="(?<digest>[^"]+)")?[\s\S]*\/>/u

const noteRegex = /<Note id="(?<id>[^"]+)" \/>/u

export const useActiveThread = () => {
  const {
    activeModelState: [activeModel],
    activeThreadState: [activeThread],
    portState: [port]
  } = useGlobal()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isResponding, setIsResponding] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [botIconIndex, setBotIconIndex] = useState<number>(0)

  const aiMessageRef = useRef<ChatMessage>()
  const abortRef = useRef(false)

  const getMdRoleLine = useCallback(
    (role: Role, id: string) => {
      switch (role) {
        case Role.User:
          return `<User id="${id}" />`
        case Role.Bot:
          return `<Bot id="${id}" system="${systemPrompt}" model="${activeModel.name}" digest="${activeModel.digest}" />`
        case Role.Note:
        default:
          return `<Note id="${id}" />`
      }
    },
    [systemPrompt, activeModel]
  )

  useEffect(() => {
    let unlisten: () => void

    async function init() {
      const { invoke } = await import("@tauri-apps/api/tauri")
      const { appWindow } = await import("@tauri-apps/api/window")

      const eventId = `read_thread_file:${nanoid()}`

      let currentRole: Role

      const messagesBuffer: ChatMessage[] = []
      let metadataIndicatorCount = 1
      let lastSystemPrompt = DEFAULT_SYSTEM_PROMPT
      let tagBuffer = ""
      let bufferIndex = -1

      const addMessage = (regexp: RegExp, role: Role) => {
        currentRole = role
        const match = tagBuffer.match(regexp)
        messagesBuffer.push({
          id: match.groups.id,
          role,
          content: ""
        })
        bufferIndex++
        tagBuffer = ""
        return { role, match }
      }

      unlisten = await appWindow.listen<ThreadReadData>(
        eventId,
        ({ payload: { line, done } }) => {
          if (done) {
            setMessages([...messagesBuffer.reverse()])
            setSystemPrompt(lastSystemPrompt)
            unlisten?.()
            return
          }

          if (line === "---") {
            // frontmatter
            if (metadataIndicatorCount > 0) {
              metadataIndicatorCount--
              currentRole = Role.Metadata
              return
            } else {
              currentRole = null
            }
          }

          // Parse frontmatter here:
          if (currentRole === Role.Metadata) {
            const [key, value] = line.split(": ")
            switch (key) {
              case "icon":
                setBotIconIndex(parseInt(value))
                break
            }
            return
          } else {
            if (
              line.startsWith("<Bot") ||
              line.startsWith("<User") ||
              line.startsWith("<Note") ||
              tagBuffer.length > 0
            ) {
              tagBuffer += line + "\n"
            }
          }

          if (userRegex.test(tagBuffer)) {
            addMessage(userRegex, Role.User)
            return
          }

          // Check for note
          if (noteRegex.test(tagBuffer)) {
            addMessage(noteRegex, Role.Note)
            return
          }

          // Check for bot
          if (botRegex.test(tagBuffer)) {
            const { match } = addMessage(botRegex, Role.Bot)
            lastSystemPrompt = match.groups.system
            return
          }

          // If the line did not match any of the tags, add it to the content of the current message
          if (bufferIndex >= 0 && tagBuffer.length === 0) {
            messagesBuffer[bufferIndex].content += line + "\n"
          }
        }
      )

      await invoke<string>("read_thread_file", {
        path: activeThread,
        eventId
      })
    }
    init()
    return () => {
      unlisten?.()
    }
  }, [activeThread])

  const appendMessage = async (message: ChatMessage) => {
    const content = [
      "\n",
      getMdRoleLine(message.role, message.id),
      "\n",
      message.content,
      "\n"
    ].join("")

    const { invoke } = await import("@tauri-apps/api/tauri")
    return invoke<string>("append_thread_content", {
      path: activeThread,
      content
    })
  }

  const addNote = async (text: string) => {
    setIsResponding(true)
    const newMessage: ChatMessage = {
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

  const startInference = async (text: string) => {
    if (isResponding) {
      return
    }
    const newMessages: ChatMessage[] = [
      {
        id: nanoid(),
        role: Role.User,
        content: text
      },
      ...messages
    ]
    setMessages(newMessages)
    setIsResponding(true)

    await appendMessage(newMessages[0])

    aiMessageRef.current = {
      id: nanoid(),
      role: Role.Bot,
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
            prompt: getQAPrompt(text, systemPrompt),
            max_tokens: 4200,
            temperature: 0.9,
            stream: true
          })
        }
      )

      if (fetchStream.status !== 200) {
        throw new Error(`Server responded with ${fetchStream.status}`)
      }

      const reader = fetchStream.body.getReader()
      const decoder = new TextDecoder("utf-8")

      async function processToken() {
        let readingBuffer = await reader.read()
        while (!readingBuffer.done && !abortRef.current) {
          try {
            const result =
              typeof readingBuffer.value === "string"
                ? readingBuffer.value
                : decoder.decode(readingBuffer.value, { stream: true })

            if (result?.startsWith(SSE_DATA_EVENT_PREFIX)) {
              const eventData = result
                .slice(SSE_DATA_EVENT_PREFIX.length)
                .trim()
              const resp = JSON.parse(eventData) as StreamResponse

              aiMessageRef.current.content += resp.choices[0].text
              setMessages([aiMessageRef.current, ...newMessages])
            }
          } catch (_) {}

          readingBuffer = await reader.read()
        }

        abortRef.current = false
        await appendMessage(aiMessageRef.current)
        setIsResponding(false)
        if (!readingBuffer.done) {
          await reader.cancel()
        }
      }

      await processToken()
    } catch (error) {
      alert(`ERROR: Server was not started OR no model was loaded.`)
      setIsResponding(false)
    }
  }

  return {
    messages,
    isResponding,
    botIconIndex,
    addNote,
    startInference,
    stopInference,
    systemPrompt,
    setSystemPrompt
  }
}
