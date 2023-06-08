import { Button } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import {
  CheckIcon,
  Cross2Icon,
  Pencil1Icon,
  TrashIcon
} from "@radix-ui/react-icons"
import {
  MessageText,
  PeopleTag,
  SidebarCollapse,
  SidebarExpand
} from "iconoir-react"
import { useMemo, useRef } from "react"

import { NavButton } from "~features/layout/nav-button"
import { useToggle } from "~features/layout/use-toggle"
import { ViewBody } from "~features/layout/view"
import type { FileInfo } from "~features/model-downloader/model-file"
import { Route, useGlobal } from "~providers/global"

const iconMap = {
  chat: MessageText,
  agent: PeopleTag
} as const

export type ChatType = keyof typeof iconMap

function ChatIcon({ type = undefined as ChatType }) {
  const Icon = useMemo(() => iconMap[type], [type])

  return <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
}

function ThreadItem({ item = null as FileInfo, index = 0 }) {
  const {
    activeThreadState: [activeThread, setActiveThread],
    threadsDirectoryState: {
      removeThread,
      updateThreadsDirectory,
      renameThread
    }
  } = useGlobal()

  const [isEditing, toggleIsEditting] = useToggle()

  const threadName = useMemo(() => item.name.slice(0, -2), [item])
  const newNameRef = useRef("")

  const rename = async () => {
    if (!newNameRef.current) {
      return
    }
    const newPath = await renameThread(item, newNameRef.current)

    toggleIsEditting()

    await updateThreadsDirectory()

    setActiveThread(newPath)
  }

  if (isEditing) {
    return (
      <li className="flex relative group gap-1 justify-center items-center px-2">
        <Input
          defaultValue={threadName}
          placeholder="Name"
          onChange={(e) => (newNameRef.current = e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              rename()
            }
          }}
        />
        <Button className="p-1 h-6" onClick={rename}>
          <CheckIcon />
        </Button>
        <Button className="p-1 h-6" onClick={toggleIsEditting}>
          <Cross2Icon />
        </Button>
      </li>
    )
  }

  return (
    <li className="flex relative group">
      <NavButton
        route={Route.Chat}
        isActive={item.path === activeThread}
        onPressed={async () => {
          setActiveThread(item.path)
        }}>
        <ChatIcon type={"chat"} />
        <div className="w-full flex">{threadName}</div>
      </NavButton>
      <div className="group-hover:opacity-100 opacity-0 transition-opacity absolute right-2 flex gap-1 self-center">
        <Button className="p-1 h-6" onClick={toggleIsEditting}>
          <Pencil1Icon />
        </Button>
        <Button
          className="p-1 h-6"
          onClick={async () => {
            await removeThread(item)
            const { files } = await updateThreadsDirectory()

            if (files.length === 0) {
              return
            }

            if (index > files.length - 1) {
              setActiveThread(files[files.length - 1].path)
              return
            }

            setActiveThread(files[index].path)
          }}>
          <TrashIcon />
        </Button>
      </div>
    </li>
  )
}

export function ChatSideBar() {
  const {
    threadsDirectoryState: { threads }
  } = useGlobal()

  return (
    <ViewBody>
      <ul
        role="list"
        className="flex flex-1 flex-col gap-y-4 overflow-auto border-b border-gray-3 p-4 h-full">
        {threads.map((item, index) => (
          <ThreadItem item={item} index={index} key={item.path} />
        ))}
      </ul>
    </ViewBody>
  )
}

export function ChatSideBarToggle() {
  const {
    onboardState: [onboard],
    serverStartedState: [isStarted],
    sidebarState: [isSidebarShowing, toggleSidebar]
  } = useGlobal()

  if (!isStarted && !onboard) {
    return null
  }
  return (
    <Button onClick={() => toggleSidebar()}>
      {isSidebarShowing ? <SidebarCollapse /> : <SidebarExpand />}
    </Button>
  )
}
