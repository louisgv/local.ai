import { Input } from "@localai/ui/input"
import {
  BasketballAlt,
  BreadSlice,
  CoffeeCup,
  Cpu,
  ElectronicsChip,
  ElectronicsTransistor,
  FavouriteBook,
  Palette,
  Pokeball
} from "iconoir-react"
import { useMemo } from "react"

import { ViewBody, ViewContainer, ViewHeader } from "~features/layout/view"
import { MessageBlock } from "~features/thread/message-block"
import { PromptTextarea } from "~features/thread/prompt-textarea"
import { useActiveThread } from "~features/thread/use-active-thread"

const botIconList = [
  BreadSlice,
  CoffeeCup,
  Pokeball,
  ElectronicsTransistor,
  ElectronicsChip,
  Cpu,
  Palette,
  FavouriteBook,
  BasketballAlt
]

export const ChatView = () => {
  const {
    messages,
    addNote,
    startInference,
    systemPrompt,
    setSystemPrompt,
    isResponding,
    botIconIndex
  } = useActiveThread()

  const botIconClass = useMemo(
    () => botIconList[botIconIndex % botIconList.length],
    [botIconIndex]
  )

  return (
    <ViewContainer>
      <ViewHeader>
        <Input
          className="w-full"
          placeholder="System Prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
      </ViewHeader>
      <ViewBody className="p-4 pr-0 flex flex-col gap-6 overflow-hidden">
        <ViewBody className="p-4 pl-0 flex flex-col-reverse gap-4 h-full overflow-auto">
          {messages.map((message) => (
            <MessageBlock
              from={message.role}
              BotIcon={botIconClass}
              key={message.id}>
              {message.content}
            </MessageBlock>
          ))}
        </ViewBody>

        <PromptTextarea
          className="sticky bottom-0 pr-4"
          disabled={isResponding}
          clearInput
          onNote={addNote}
          onSubmit={startInference}
        />
      </ViewBody>
    </ViewContainer>
  )
}
