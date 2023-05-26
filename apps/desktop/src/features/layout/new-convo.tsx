import { Button } from "@localai/ui/button"
import { AddCircle, TriangleFlag } from "iconoir-react"

import { useGlobal } from "~providers/global"

export const NewConvoButton = ({ className = "" }) => {
  const {
    activeChatState: [_, setActiveChat],
    chatListState: [chatList, setChatList]
  } = useGlobal()

  return (
    <Button
      className={className}
      onClick={() => {
        const caseId = (chatList[0]?.id || 0) + 1
        setActiveChat(caseId)
        setChatList((cc) => [
          {
            id: caseId,
            name: `Convo ${caseId}`,
            href: `/chat/${caseId}`,
            icon: TriangleFlag,
            count: 12
          },
          ...cc
        ])
      }}>
      <AddCircle /> New Conversation
    </Button>
  )
}
