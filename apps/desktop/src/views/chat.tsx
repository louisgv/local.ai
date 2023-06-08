import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import { Textarea } from "@localai/ui/textarea"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GearIcon
} from "@radix-ui/react-icons"
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

import { useToggle } from "~features/layout/use-toggle"
import { ViewBody, ViewContainer, ViewHeader } from "~features/layout/view"
import { MessageBlock } from "~features/thread/message-block"
import { PromptTextarea } from "~features/thread/prompt-textarea"
import { ChatSideBarToggle } from "~features/thread/side-bar"
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

  const [isConfigVisible, toggleConfig] = useToggle(false)

  return (
    <ViewContainer className="flex-row overflow-hidden">
      <ViewContainer>
        <ViewHeader>
          <ChatSideBarToggle />
          <Input
            className="w-full"
            placeholder="System Message"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
          <Button className="gap-0" onClick={() => toggleConfig()}>
            {!isConfigVisible && <ChevronLeftIcon />}

            <GearIcon
              className={cn(
                "will-change-transform",
                "transition-transform",
                isConfigVisible ? "rotate-180" : "-rotate-180"
              )}
            />
            {isConfigVisible && <ChevronRightIcon />}
          </Button>
        </ViewHeader>
        <ViewBody className="p-4 pr-0 flex flex-col gap-6 overflow-hidden">
          <ViewBody className="p-4 pl-0 flex flex-col-reverse gap-4 h-full overflow-auto max-w-screen-md mx-auto">
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
            className="sticky bottom-0 max-w-screen-md pr-4 self-center"
            disabled={isResponding}
            clearInput
            onNote={addNote}
            onSubmit={startInference}
          />
        </ViewBody>
      </ViewContainer>
      <ViewContainer
        className={cn(
          "transition-all",
          isConfigVisible ? "w-1/4 opacity-100" : "w-0 opacity-0",
          "border-l border-l-gray-6"
        )}>
        <ViewBody className="p-4 flex flex-col gap-6 overflow-auto items-start">
          <Textarea
            rows={8}
            title="Prompt template (WIP)"
            defaultValue={`
<BOT>: {SYSTEM}
<HUMAN>: {PROMPT}
<BOT>:`}
          />
          <Input placeholder="Temperature (WIP)" defaultValue={0.47} />
          <Input placeholder="Max Tokens (WIP)" defaultValue={0.47} />
        </ViewBody>
      </ViewContainer>
    </ViewContainer>
  )
}
