import { Button } from "@localai/ui/button"
import { fetch } from "@tauri-apps/api/http"

import { ViewBody, ViewContainer, ViewHeader } from "~features/layout/view"
import { MessageBlock } from "~features/thread/message-block"
import { useGlobal } from "~providers/global"

export const ChatView = () => {
  const {
    activeChatState: [activeChat],
    portState: [port]
  } = useGlobal()
  return (
    <ViewContainer>
      <ViewHeader>
        <span>Thread {activeChat}</span>
        {/* Edit title */}
      </ViewHeader>
      <ViewBody>
        <MessageBlock />
        <Button
          onClick={async () => {
            const d = await fetch(`http://localhost:${port}/model`, {
              method: "POST"
            })

            console.log(d)
          }}>
          Test test
        </Button>
      </ViewBody>
    </ViewContainer>
  )
}
