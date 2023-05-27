import type { NextPage } from "next"

import { ViewContainer, ViewHeader } from "~features/layout/view"
import { MessageBlock } from "~features/thread/message-block"
import { useGlobal } from "~providers/global"

export const ChatView: NextPage = () => {
  const {
    activeChatState: [activeChat]
  } = useGlobal()
  return (
    <ViewContainer>
      <ViewHeader>Thread {activeChat}</ViewHeader>
      <MessageBlock>
        {`
# h1
## h2     

Est quis cupidatat consequat pariatur nostrud consectetur velit minim duis magna velit consequat tempor occaecat. Labore Lorem ut eu adipisicing qui nulla sunt voluptate voluptate id ad consequat tempor. Exercitation veniam labore Lorem velit ullamco. Et dolore aliquip quis incididunt dolor deserunt eu laborum eu. Ex est anim laborum nostrud aute nulla.

### h3

Enim ad laboris sunt deserunt id nostrud aliquip. Tempor do anim pariatur esse pariatur velit. Esse sint pariatur elit ad adipisicing officia. Occaecat aliquip aliqua sunt aute consequat non non amet velit.


    `}
      </MessageBlock>
    </ViewContainer>
  )
}
