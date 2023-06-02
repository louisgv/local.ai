import { Button } from "@localai/ui/button"
import { TrashIcon } from "@radix-ui/react-icons"
import { MessageText, PeopleTag } from "iconoir-react"
import { useMemo } from "react"

import { NavButton } from "~features/layout/nav-button"
import { ViewBody } from "~features/layout/view"
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

export function ChatSideBar() {
  const {
    activeChatState: [activeChat, setActiveChat],
    chatListState: [chatList, setChatList]
  } = useGlobal()

  return (
    <ViewBody>
      <ul
        role="list"
        className="flex flex-1 flex-col gap-y-4 overflow-auto px-4 border-b border-gray-3 py-4 pr-2 h-full">
        {chatList.map((item) => (
          <li key={item.name} className="flex relative group">
            <NavButton
              route={Route.Chat}
              isActive={item.id === activeChat}
              onPressed={async () => {
                setActiveChat(item.id)
              }}>
              <ChatIcon type={item.type} />
              <div className="w-full flex">{item.name}</div>
            </NavButton>

            <button
              className="absolute right-0 flex items-center justify-center w-12 h-full rounded-full text-gray-11 hover:text-gray-12 group-hover:opacity-100 opacity-0 transition-opacity"
              onClick={() => {
                const removeIndex = chatList.findIndex(
                  (chat) => chat.id === item.id
                )

                if (removeIndex !== -1) {
                  // check if item is found
                  // creating a new array by removing the item
                  const newChatList = [
                    ...chatList.slice(0, removeIndex),
                    ...chatList.slice(removeIndex + 1)
                  ]
                  setChatList(newChatList)

                  if (activeChat === item.id) {
                    let newActiveChat = newChatList[removeIndex - 1]?.id
                    if (removeIndex === 0 && newChatList.length > 0) {
                      // if the removed item was the first in the list, select the new first item
                      newActiveChat = newChatList[0]?.id
                    }

                    setActiveChat(newActiveChat)
                  }
                }
              }}>
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
    </ViewBody>
  )
}
