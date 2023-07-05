import { cn } from "@lab/theme/utils"
import { Button } from "@lab/ui/button"
import { Input } from "@lab/ui/input"
import { Spinner } from "@lab/ui/spinner"
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

import { ViewBody, ViewContainer, ViewHeader } from "~features/layout/view"
import { MessageBlock } from "~features/thread/message-block"
import { PromptTextarea } from "~features/thread/prompt-textarea"
import { ChatSideBarToggle } from "~features/thread/side-bar"
import { ThreadConfigPanel } from "~features/thread/thread-config-panel"
import { ThreadModelSelector } from "~features/thread/thread-model-selector"
import { useGlobal } from "~providers/global"
import { ThreadProvider, useThread } from "~providers/thread"

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

const MainPanel = () => {
  const {
    threadViewConfigPanelState: [isConfigVisible, toggleConfig]
  } = useGlobal()
  const {
    messages,
    addNote,
    startInference,
    stopInference,
    isResponding,
    botIconIndex,
    threadConfig,
    statusMessage
  } = useThread()

  const botIconClass = useMemo(
    () => botIconList[botIconIndex % botIconList.length],
    [botIconIndex]
  )

  return (
    <ViewContainer>
      <ViewHeader>
        <ChatSideBarToggle />
        <ThreadModelSelector />
        <Input
          className="w-full"
          placeholder="System Message"
          value={threadConfig.data.systemMessage}
          onChange={(e) => {
            threadConfig.update({
              systemMessage: e.target.value
            })
          }}
        />
        <Button
          className="w-10 p-3 items-center"
          onClick={() => toggleConfig()}>
          <span
            className={cn(
              "relative",
              "will-change-transform transition-transform duration-500",
              isConfigVisible ? "-rotate-180" : "rotate-0"
            )}>
            <ChevronLeftIcon className="absolute -left-2" />
            <GearIcon />
          </span>
        </Button>
      </ViewHeader>
      <ViewBody className="p-4 pr-0 flex flex-col gap-6 overflow-hidden">
        <ViewBody className="p-4 pl-0 flex flex-col-reverse gap-4 h-full overflow-auto max-w-screen-md mx-auto">
          {messages.map((message) => (
            <MessageBlock
              key={message.id}
              BotIcon={botIconClass}
              message={message}
            />
          ))}
        </ViewBody>
        <div className="flex flex-col sticky bottom-0 max-w-screen-md pr-4 self-center w-full gap-3">
          <div className="h-12 flex items-center justify-center w-full gap-2">
            <Spinner
              className={cn(
                "h-8 w-8 text-gray-9",
                "transition-opacity",
                isResponding ? "opacity-100" : "opacity-0"
              )}
            />
            <pre className="text-gray-10 text-sm">{statusMessage}</pre>
          </div>

          <PromptTextarea
            isResponding={isResponding}
            clearInput
            onNote={addNote}
            onSubmit={startInference}
            onStop={stopInference}
          />
        </div>
      </ViewBody>
    </ViewContainer>
  )
}

export const ThreadView = () => {
  const {
    activeThreadState: [activeThread],
    threadViewConfigPanelState: [isConfigVisible]
  } = useGlobal()

  return (
    <ThreadProvider thread={activeThread}>
      <ViewContainer className="flex-row overflow-hidden">
        <MainPanel />
        <ViewContainer
          className={cn(
            "transition-all",
            isConfigVisible ? "w-1/4 opacity-100" : "w-0 opacity-0",
            "border-l border-l-gray-6"
          )}>
          <ViewBody className="p-4 pt-5 flex flex-col gap-6 overflow-x-hidden items-start">
            <ThreadConfigPanel />
          </ViewBody>
        </ViewContainer>
      </ViewContainer>
    </ThreadProvider>
  )
}
