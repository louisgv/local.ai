import { nanoid } from "nanoid"
import { useCallback, useEffect, useState } from "react"

import {
  type ChatMessage,
  DEFAULT_SYSTEM_PROMPT,
  Role
} from "~features/thread/_shared"
import { useGlobal } from "~providers/global"

type ThreadReadData = {
  line: string
  done: boolean
}

const USER_TAG = "<User"
const BOT_TAG = "<Bot"
const NOTE_TAG = "<Note"

const idRegex = 'id="(?<id>[^"]+)"' // This regex extracts the ID, and it's common in all regexes

const userRegex = new RegExp(`${USER_TAG} ${idRegex} \\/>`, "u")
const botRegexString = [
  `${BOT_TAG}[\\s\\S]*${idRegex}`,
  `(?:[\\s\\S]*system="(?<system>[^"]+)")?`,
  `(?:[\\s\\S]*model="(?<model>[^"]+)")?`,
  `(?:[\\s\\S]*digest="(?<digest>[^"]+)")?`,
  `[\\s\\S]*\\/>`
].join("")

const botRegex = new RegExp(botRegexString, "u")
const noteRegex = new RegExp(`${NOTE_TAG} ${idRegex} \\/>`, "u")

// Append-only, static file MDX thread driver
// Can be replaced with a more dynamic, storage-based driver
export const useThreadMdx = () => {
  const {
    activeModelState: [activeModel],
    activeThreadState: [activeThread]
  } = useGlobal()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [botIconIndex, setBotIconIndex] = useState<number>(0)

  const getMdRoleLine = useCallback(
    (role: Role, id: string) => {
      switch (role) {
        case Role.User:
          return `${USER_TAG} id="${id}" />`
        case Role.Bot:
          return `${BOT_TAG} id="${id}" system="${systemPrompt}" model="${activeModel.name}" digest="${activeModel.digest}" />`
        case Role.Note:
        default:
          return `${NOTE_TAG} id="${id}" />`
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

      const messagesBuffer: ChatMessage[] = []
      let metadataIndicatorCount = 1
      let lastSystemPrompt = DEFAULT_SYSTEM_PROMPT
      let tagBuffer = ""
      let bufferIndex = -1

      const addMessage = (regexp: RegExp, role: Role) => {
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
              return
            }
          }

          // Parse frontmatter here:
          if (metadataIndicatorCount > 0) {
            const [key, value] = line.split(": ")
            switch (key) {
              case "icon":
                setBotIconIndex(parseInt(value))
                break
            }
            return
          } else {
            if (
              line.startsWith(BOT_TAG) ||
              line.startsWith(USER_TAG) ||
              line.startsWith(NOTE_TAG) ||
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
            messagesBuffer[bufferIndex].model = match.groups.model
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
      "\n\n",
      message.content,
      "\n"
    ].join("")

    const { invoke } = await import("@tauri-apps/api/tauri")
    return invoke<string>("append_thread_content", {
      path: activeThread,
      content
    })
  }

  return {
    messages,
    setMessages,
    appendMessage,
    botIconIndex,
    systemPrompt,
    setSystemPrompt
  }
}
