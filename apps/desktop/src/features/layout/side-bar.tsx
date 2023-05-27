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
    chatListState: [chatList]
  } = useGlobal()

  return (
    <ViewBody>
      <ul
        role="list"
        className="flex flex-1 flex-col gap-y-4 overflow-auto px-4 border-b border-gray-3 py-4 pr-2 h-full">
        {chatList.map((item) => (
          <li key={item.name}>
            <NavButton
              route={Route.Chat}
              isActive={item.id === activeChat}
              onPressed={async () => {
                setActiveChat(item.id)
              }}>
              <ChatIcon type={item.type} />
              {item.name}
              {item.count ? (
                <span
                  className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full py-0.5 px-2.5 text-center text-xs font-medium leading-5 ring-1 ring-inset ring-gray-6"
                  aria-hidden="true">
                  {item.count}
                </span>
              ) : null}
            </NavButton>
          </li>
        ))}
      </ul>
    </ViewBody>
  )
}
