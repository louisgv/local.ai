import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { MarkdownContainer } from "@localai/ui/markdown-container"
import { User } from "iconoir-react"
import { useMemo } from "react"

const defaultMessage = `
# h1 Occaecat exercitation
## h2 Occaecat exercitation velit mollit in ad labore eu esse.

Est quis cupidatat consequat pariatur nostrud consectetur velit minim duis magna velit consequat tempor occaecat. Labore Lorem ut eu adipisicing qui nulla sunt voluptate voluptate id ad consequat tempor. Exercitation veniam labore Lorem velit ullamco. Et dolore aliquip quis incididunt dolor deserunt eu laborum eu. Ex est anim laborum nostrud aute nulla.

### h3 Occaecat exercitation velit mollit in ad labore eu esse.

Enim ad laboris sunt deserunt id nostrud aliquip. Tempor do anim pariatur esse pariatur velit. Esse sint pariatur elit ad adipisicing officia. Occaecat aliquip aliqua sunt aute consequat non non amet velit.
`

export const MessageBlock = ({
  children = defaultMessage,
  from = "user" as "user" | "bot",
  BotIcon = User
}) => {
  const isUser = useMemo(() => from === "user", [from])
  return (
    <div className="flex gap-2">
      <div
        className={cn(
          "px-4 py-3 rounded-md w-full",
          isUser ? "bg-gray-3 hover:bg-gray-4" : "bg-blue-6 hover:bg-blue-7"
        )}>
        <MarkdownContainer>{children}</MarkdownContainer>
      </div>
      <Button
        className={cn(
          isUser ? "bg-gray-3 hover:bg-gray-4" : "bg-blue-6 hover:bg-blue-7"
        )}>
        {isUser ? <User /> : <BotIcon />}
      </Button>
    </div>
  )
}
