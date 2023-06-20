import dedent from "ts-dedent"

export enum Role {
  User = "user",
  Bot = "bot",
  Note = "note"
}

export type ThreadMessage = {
  id: string
  content: string
  role: Role

  model?: string
}

export const DEFAULT_SYSTEM_MESSAGE =
  "Greeting! I am a friendly AI assistant. Feel free to ask me anything."

export const DEFAULT_PROMPT_TEMPLATE = dedent`
  AI: {system}
  Human: {prompt}
  AI: 
`
