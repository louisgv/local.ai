import { MarkdownContainer } from "@localai/ui/markdown-container"
import type { NextPage } from "next"

export const ChatView: NextPage = () => (
  <div className="flex flex-col gap-6 p-8">
    <MarkdownContainer>
      {`
## Demo chat

This is a demo case.

| Action | Description |
| :--- | :--- |
| Delete Email | Delete the email address from the database. |
| Block IP | Block the IP address from accessing the site. |

`}
    </MarkdownContainer>
  </div>
)
