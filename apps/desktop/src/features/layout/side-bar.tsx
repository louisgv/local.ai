import { cn } from "@localai/theme/utils"

import { useGlobal } from "~providers/global"

export function ChatSideBar() {
  const {
    activeChatState: [activeChat, setActiveChat],
    chatListState: [chatList]
  } = useGlobal()

  return (
    <ul
      role="list"
      className="flex flex-1 flex-col gap-y-4 overflow-auto px-4 border-b border-gray-3 py-4 pr-2">
      {chatList.map((item) => (
        <li key={item.name}>
          <button
            onClick={() => {
              setActiveChat(item.id)
            }}
            className={cn(
              item.id === activeChat
                ? "bg-gray-3 text-gray-12"
                : "text-gray-11 hover:text-gray-12 hover:bg-gray-3",
              "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
              "w-full"
            )}>
            <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
            {item.name}
            {item.count ? (
              <span
                className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full py-0.5 px-2.5 text-center text-xs font-medium leading-5 ring-1 ring-inset ring-gray-6"
                aria-hidden="true">
                {item.count}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  )
}
