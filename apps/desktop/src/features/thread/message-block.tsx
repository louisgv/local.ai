import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { MarkdownContainer } from "@localai/ui/markdown-container"
import { Notes, User } from "iconoir-react"
import { useMemo } from "react"

import { Role, type ThreadMessage } from "~features/thread/_shared"

const defaultMessage = `
# h1 Occaecat exercitation
## h2 Occaecat exercitation velit mollit in ad labore eu esse.

Est quis cupidatat consequat pariatur nostrud consectetur velit minim duis magna velit consequat tempor occaecat. Labore Lorem ut eu adipisicing qui nulla sunt voluptate voluptate id ad consequat tempor. Exercitation veniam labore Lorem velit ullamco. Et dolore aliquip quis incididunt dolor deserunt eu laborum eu. Ex est anim laborum nostrud aute nulla.

### h3 Occaecat exercitation velit mollit in ad labore eu esse.

Enim ad laboris sunt deserunt id nostrud aliquip. Tempor do anim pariatur esse pariatur velit. Esse sint pariatur elit ad adipisicing officia. Occaecat aliquip aliqua sunt aute consequat non non amet velit.
`

// TODO: A bit convoluted atm, need refactor to make it simpler.
export const MessageBlock = ({
  BotIcon = User,
  message = {
    role: Role.User,
    content: defaultMessage
  } as ThreadMessage
}) => {
  const isUser = useMemo(() => message.role === Role.User, [message])
  const isBot = useMemo(() => message.role === Role.Bot, [message])
  const isNote = useMemo(() => message.role === Role.Note, [message])

  return (
    <div className="flex group">
      <div
        className={cn(
          "px-4 py-3 rounded-md rounded-tr-none w-full transition-colors",
          isUser && "bg-gray-4 hover:bg-gray-5 text-gray-11 hover:text-gray-12",
          isNote && "bg-gold-7 hover:bg-gold-8 text-gold-11 hover:text-gold-12",
          isBot && "bg-blue-7 hover:bg-blue-8 text-blue-11 hover:text-blue-12"
        )}>
        <MarkdownContainer className={cn("max-w-screen-sm")}>
          {message.content}
        </MarkdownContainer>

        {message.model && (
          <pre className="flex text-xs justify-end mt-4">{message.model}</pre>
        )}
      </div>
      <Button
        className={cn(
          "w-12 h-12 p-0 justify-center",
          "transition-colors rounded-l-none",
          isUser && "bg-gray-3 hover:bg-gray-4",
          isNote && "bg-gold-6 hover:bg-gold-7 text-gold-11 hover:text-gold-12",
          isBot && "bg-blue-6 hover:bg-blue-7 text-blue-11 hover:text-blue-12"
        )}>
        {isUser && <User />}
        {isBot && <BotIcon />}
        {isNote && <Notes />}
      </Button>
    </div>
  )
}
