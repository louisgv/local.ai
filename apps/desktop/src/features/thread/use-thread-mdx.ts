import { paramCase } from "change-case"
import { nanoid } from "nanoid"
import { useEffect, useMemo, useReducer, useRef, useState } from "react"

import { InvokeCommand, invoke } from "~features/invoke"
import type { ThreadConfig } from "~features/invoke/thread"
import type {
  FileInfo,
  ModelMetadata
} from "~features/model-downloader/model-file"
import { Role, type ThreadMessage } from "~features/thread/_shared"
import { getMdxProp, getMdxTickProp } from "~features/thread/mdx-parser"

type ThreadReadData = {
  line: string
  done: boolean
}

const USER_TAG = "<User"
const BOT_TAG = "<Bot"
const NOTE_TAG = "<Note"

const getStrPropRegex = (propKey: string) =>
  `(?:[\\s\\S]*${propKey}="(?<${propKey}>[^"]+)")?`

const roleRegex = `(?<role>${USER_TAG}|${BOT_TAG}|${NOTE_TAG})`
const idRegex = getStrPropRegex("id")

const messageRegexString = [
  roleRegex,
  idRegex,
  getStrPropRegex("model"),
  getStrPropRegex("digest"),
  getStrPropRegex("system"),
  getStrPropRegex("timestamp"),
  `[\\s\\S]*\\/>`
].join("")

const messageRegex = new RegExp(messageRegexString, "u")

const getMdRoleLine = (
  { role, id, timestamp }: ThreadMessage,
  config = null as ThreadConfig,
  model = null as ModelMetadata
) => {
  switch (role) {
    case Role.User:
      return `${USER_TAG} id="${id}" timestamp="${timestamp}" />`
    case Role.Bot:
      return [
        BOT_TAG,
        `\n\tid="${id}"`,
        `\n\tmodel="${model?.name}"`,
        getMdxProp(model, "digest"),
        getMdxProp(config, "systemMessage", "system"),
        `\n\ttimestamp="${timestamp}"`,
        getMdxTickProp(config, "promptTemplate"),
        getMdxProp(config, "tokenizer"),
        getMdxProp(config, "completionParams"),
        "\n/>"
      ].join("")
    case Role.Note:
    default:
      return `${NOTE_TAG} id="${id}" timestamp="${timestamp}" />`
  }
}

export const createMessage = (
  role: Role,
  content: string,
  data?: Partial<ThreadMessage>
): ThreadMessage => ({
  id: nanoid(),
  timestamp: new Date().toISOString(),
  role,
  content,
  ...data
})

function isThreadMessage(message: any): message is ThreadMessage {
  return typeof message.id === "string"
}

type MessageMap = Record<string, ThreadMessage>
type MessageMapAction =
  | { type: "init" }
  | { type: "add"; payload: ThreadMessage }
  | { type: "concat"; payload: Omit<ThreadMessage, "role"> }

function messageMapReducer(state: MessageMap, action: MessageMapAction) {
  switch (action.type) {
    case "concat":
      state[action.payload.id].content += action.payload.content
      return {
        ...state
      }
    case "add":
      return {
        [action.payload.id]: { ...action.payload },
        ...state
      }
    case "init":
    default:
      return {}
  }
}

// Append-only, static file MDX thread driver
// Can be replaced with a more dynamic, storage-based driver
export const useThreadMdx = (thread: FileInfo) => {
  const [messageMap, dispatch] = useReducer(messageMapReducer, {})

  const [botIconIndex, setBotIconIndex] = useState<number>(0)

  const messages = useMemo(() => Object.values(messageMap), [messageMap])

  useEffect(() => {
    let aborted = false
    let unlisten: () => void

    async function init() {
      const { appWindow } = await import("@tauri-apps/api/window")

      const eventId = `read_thread_file:${nanoid()}`

      dispatch({ type: "init" })

      let metadataIndicatorCount = 1
      let tagBuffer = ""
      let bufferId = ""

      const addMessage = (regexp: RegExp) => {
        const match = tagBuffer.match(regexp)
        if (isThreadMessage(match.groups)) {
          const role = paramCase(match.groups.role.slice(1)) as Role
          dispatch({
            type: "add",
            payload: {
              ...match.groups,
              role,
              content: "",
              metatag: tagBuffer // Can be used later to extract props
            }
          })
          bufferId = match.groups.id
          tagBuffer = ""
        }
      }

      if (aborted) {
        return
      }

      unlisten = await appWindow.listen<ThreadReadData>(
        eventId,
        ({ payload: { line, done } }) => {
          if (done) {
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

          if (messageRegex.test(tagBuffer)) {
            addMessage(messageRegex)
            return
          }

          // If the line did not match any of the tags, add it to the content of the current message
          if (!!bufferId && tagBuffer.length === 0) {
            dispatch({
              type: "concat",
              payload: {
                id: bufferId,
                content: `${line}\n`
              }
            })
          }
        }
      )

      await invoke(InvokeCommand.ReadThreadFile, {
        path: thread.path,
        eventId
      })
      if (aborted) {
        unlisten()
      }
    }
    init()
    return () => {
      aborted = true
      unlisten?.()
    }
  }, [thread.path])

  const appendMessage = async (
    message: ThreadMessage,
    config?: ThreadConfig,
    model?: ModelMetadata
  ) => {
    const content = [
      "\n",
      getMdRoleLine(message, config, model),
      "\n\n",
      message.content.trim(),
      "\n"
    ].join("")

    return invoke(InvokeCommand.AppendThreadContent, {
      path: thread.path,
      content
    })
  }

  return {
    messages,
    dispatch,
    appendMessage,
    botIconIndex
  }
}
