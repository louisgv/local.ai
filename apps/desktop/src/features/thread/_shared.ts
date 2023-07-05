import dedent from "ts-dedent"

import type { ThreadConfig } from "~features/invoke/thread"

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
  digest?: string
  timestamp?: string

  metatag?: string
}

export const DEFAULT_SYSTEM_MESSAGE =
  "Greeting! I am a friendly AI assistant. Feel free to ask me anything."

export const DEFAULT_PROMPT_TEMPLATE = dedent`
  AI: {system}
  Human: {prompt}
  AI: 
`

export const DEFAULT_THREAD_CONFIG: ThreadConfig = {
  promptTemplate: DEFAULT_PROMPT_TEMPLATE,
  systemMessage: DEFAULT_SYSTEM_MESSAGE,
  completionParams: {
    sampler: "top-p-top-k",
    prompt: "",
    max_tokens: 0, // Use maximum amount
    temperature: 1.0,
    seed: 147,
    frequency_penalty: 0.6,
    presence_penalty: 0.0,
    top_k: 42,
    top_p: 1.0,
    stop: ["AI: ", "Human: "]
  }
}
