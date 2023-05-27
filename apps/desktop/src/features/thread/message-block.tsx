import { MarkdownContainer } from "@localai/ui/markdown-container"

export const MessageBlock = ({ children = "" }) => {
  return (
    <div className="relative p-8">
      <div className="bg-gray-3 px-4 py-3 hover:bg-gray-4 rounded-md">
        <MarkdownContainer>{children}</MarkdownContainer>
      </div>
    </div>
  )
}
