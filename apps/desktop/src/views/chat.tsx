import { MarkdownContainer } from "@localai/ui/markdown-container"
import type { NextPage } from "next"

import { useGlobal } from "~providers/global"

export const ChatView: NextPage = () => {
  const {
    activeChatState: [activeChat]
  } = useGlobal()
  return (
    <div className="flex flex-col gap-6 p-8 bg-gray-2">
      <MarkdownContainer>
        {`
## Chat ${activeChat}
    
This is a demo chat.

- [x] This is a task
    `}
      </MarkdownContainer>
    </div>
  )
}
