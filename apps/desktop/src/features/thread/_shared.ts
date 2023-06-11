export enum Role {
  Metadata = "metadata",
  User = "user",
  Bot = "bot",
  Note = "note"
}

export type ChatMessage = {
  id: string
  content: string
  role: Role
}

export const DEFAULT_SYSTEM_PROMPT =
  "Greeting! I am a friendly AI assistant. Feel free to ask me anything."
