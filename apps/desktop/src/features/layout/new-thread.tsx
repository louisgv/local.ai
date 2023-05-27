import { Button } from "@localai/ui/button"
import { AddCircle } from "iconoir-react"

import { Route, useGlobal } from "~providers/global"

export const NewThreadButton = ({ className = "" }) => {
  const {
    activeChatState: [_, setActiveChat],
    chatListState: [chatList, setChatList],
    routeState: [__, setCurrentRoute]
  } = useGlobal()

  return (
    <Button
      className={className}
      onClick={async () => {
        const chatId = (chatList[0]?.id || 0) + 1
        setActiveChat(chatId)
        setChatList((cc) => [
          {
            id: chatId,
            name: `Thread ${chatId}`,
            type: "chat",
            count: 12
          },
          ...cc
        ])
        setCurrentRoute(Route.Chat)
      }}>
      <AddCircle /> New Thread
    </Button>
  )
}
