import { ViewBody, ViewContainer, ViewHeader } from "~features/layout/view"
import { MessageBlock } from "~features/thread/message-block"
import { useGlobal } from "~providers/global"

export const ChatView = () => {
  const {
    activeChatState: [activeChat]
  } = useGlobal()
  return (
    <ViewContainer>
      <ViewHeader>
        <span>Thread {activeChat}</span>
        {/* Edit title */}
      </ViewHeader>
      <ViewBody>
        <MessageBlock />
      </ViewBody>
    </ViewContainer>
  )
}
