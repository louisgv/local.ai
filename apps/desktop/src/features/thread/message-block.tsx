import { MarkdownContainer } from "@localai/ui/markdown-container"

const defaultMessage = `
# h1 Occaecat exercitation
## h2 Occaecat exercitation velit mollit in ad labore eu esse.

Est quis cupidatat consequat pariatur nostrud consectetur velit minim duis magna velit consequat tempor occaecat. Labore Lorem ut eu adipisicing qui nulla sunt voluptate voluptate id ad consequat tempor. Exercitation veniam labore Lorem velit ullamco. Et dolore aliquip quis incididunt dolor deserunt eu laborum eu. Ex est anim laborum nostrud aute nulla.

### h3 Occaecat exercitation velit mollit in ad labore eu esse.

Enim ad laboris sunt deserunt id nostrud aliquip. Tempor do anim pariatur esse pariatur velit. Esse sint pariatur elit ad adipisicing officia. Occaecat aliquip aliqua sunt aute consequat non non amet velit.
`

export const MessageBlock = ({ children = defaultMessage }) => {
  return (
    <div className="relative p-8">
      <div className="bg-gray-3 px-4 py-3 hover:bg-gray-4 rounded-md">
        <MarkdownContainer>{children}</MarkdownContainer>
      </div>
    </div>
  )
}
