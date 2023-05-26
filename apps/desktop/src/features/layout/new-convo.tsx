import { Button } from "@localai/ui/button"
import { AddCircle } from "iconoir-react"

import { useGlobal } from "~providers/global"

export const NewConvoButton = ({ className = "" }) => {
  const {
    activeChatState: [_, setActiveChat],
    chatListState: [chatList, setChatList]
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
            name: `Convo ${chatId}`,
            type: "chat",
            count: 12
          },
          ...cc
        ])
      }}>
      <AddCircle /> New Conversation
    </Button>
  )
}
