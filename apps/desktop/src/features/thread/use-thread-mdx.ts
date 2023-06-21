import { nanoid } from "nanoid"
import { useEffect, useState } from "react"
import dedent from "ts-dedent"

import { InvokeCommand, invoke } from "~features/invoke"
import type { ThreadConfig } from "~features/invoke/thread"
import type {
  FileInfo,
  ModelMetadata
} from "~features/model-downloader/model-file"
import {
  DEFAULT_SYSTEM_MESSAGE,
  Role,
  type ThreadMessage
} from "~features/thread/_shared"

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

const getMdRoleLine = (
  { role, id }: ThreadMessage,
  model = null as ModelMetadata,
  config = null as ThreadConfig
) => {
  switch (role) {
    case Role.User:
      return `${USER_TAG} id="${id}" />`
    case Role.Bot:
      return dedent`
      ${BOT_TAG} id="${id}" model="${model?.name}" 
        digest="${model?.digest}" 
        system="${config.systemMessage}" 
      />
    `
    case Role.Note:
    default:
      return `${NOTE_TAG} id="${id}" />`
  }
}

// Append-only, static file MDX thread driver
// Can be replaced with a more dynamic, storage-based driver
export const useThreadMdx = (thread: FileInfo, model?: ModelMetadata) => {
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [botIconIndex, setBotIconIndex] = useState<number>(0)

  useEffect(() => {
    let unlisten: () => void

    async function init() {
      const { appWindow } = await import("@tauri-apps/api/window")

      const eventId = `read_thread_file:${nanoid()}`

      const messagesBuffer: ThreadMessage[] = []
      let metadataIndicatorCount = 1
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
            messagesBuffer[bufferIndex].model = match.groups.model
            return
          }

          // If the line did not match any of the tags, add it to the content of the current message
          if (bufferIndex >= 0 && tagBuffer.length === 0) {
            messagesBuffer[bufferIndex].content += line + "\n"
          }
        }
      )

      await invoke(InvokeCommand.ReadThreadFile, {
        path: thread.path,
        eventId
      })
    }
    init()
    return () => {
      unlisten?.()
    }
  }, [thread])

  const appendMessage = async (
    message: ThreadMessage,
    config?: ThreadConfig
  ) => {
    const content = [
      "\n",
      getMdRoleLine(message, model, config),
      "\n\n",
      message.content,
      "\n"
    ].join("")

    return invoke(InvokeCommand.AppendThreadContent, {
      path: thread.path,
      content
    })
  }

  return {
    messages,
    setMessages,
    appendMessage,
    botIconIndex
  }
}
