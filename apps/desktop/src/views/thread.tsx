import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { FloatInput } from "@localai/ui/float-input"
import { Input } from "@localai/ui/input"
import { Spinner } from "@localai/ui/spinner"
import { Textarea } from "@localai/ui/textarea"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GearIcon,
  ResetIcon
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
import { DEFAULT_PROMPT_TEMPLATE } from "~features/thread/_shared"
import { MessageBlock } from "~features/thread/message-block"
import { PromptTextarea } from "~features/thread/prompt-textarea"
import { QuickModelLoaderSelector } from "~features/thread/quick-model-loader-selector"
import { ChatSideBarToggle } from "~features/thread/side-bar"
import {
  DEFAULT_THREAD_CONFIG,
  useActiveThread
} from "~features/thread/use-active-thread"

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

export const ThreadView = () => {
  const {
    messages,
    addNote,
    startInference,
    stopInference,
    systemPrompt,
    setSystemPrompt,
    isResponding,
    botIconIndex,
    threadConfig,
    setCompletionParams
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
          <QuickModelLoaderSelector />
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
                key={message.id}
                BotIcon={botIconClass}
                message={message}
              />
            ))}
          </ViewBody>
          <div className="flex flex-col sticky bottom-0 max-w-screen-md pr-4 self-center w-full gap-3">
            <div className="h-12 flex items-center justify-center w-full">
              {isResponding && <Spinner className="h-8 w-8 text-blue-9" />}
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
      <ViewContainer
        className={cn(
          "transition-all",
          isConfigVisible ? "w-1/4 opacity-100" : "w-0 opacity-0",
          "border-l border-l-gray-6"
        )}>
        <ViewBody className="p-4 flex flex-col gap-6 overflow-auto items-start w-full">
          <Textarea
            rows={8}
            title="Prompt template"
            value={threadConfig.data.promptTemplate}
            onChange={(e) =>
              threadConfig.update({
                promptTemplate: e.target.value
              })
            }
            onRevert={() => {
              threadConfig.update({
                promptTemplate: DEFAULT_PROMPT_TEMPLATE
              })
            }}
          />

          <FloatInput
            placeholder="Temperature"
            value={threadConfig.data.completionParams.temperature}
            onDone={(v) =>
              setCompletionParams({
                temperature: v
              })
            }
            onRevert={() => {
              setCompletionParams({
                temperature: DEFAULT_THREAD_CONFIG.completionParams.temperature
              })
            }}
          />

          <FloatInput
            placeholder="Top P"
            value={threadConfig.data.completionParams.top_p}
            onDone={(v) =>
              setCompletionParams({
                top_p: v
              })
            }
          />

          <FloatInput
            placeholder="Frequency Penalty"
            value={threadConfig.data.completionParams.frequency_penalty}
            onDone={(v) =>
              setCompletionParams({
                frequency_penalty: v
              })
            }
          />

          <FloatInput
            placeholder="Presence Penalty"
            value={threadConfig.data.completionParams.presence_penalty}
            onDone={(v) =>
              setCompletionParams({
                presence_penalty: v
              })
            }
          />

          <Input
            placeholder="Stop Words"
            value={(threadConfig.data.completionParams.stop || []).join(",")}
            onChange={(e) =>
              setCompletionParams({
                stop: e.target.value.split(",").map((s) => s.trim())
              })
            }
          />

          <Input
            placeholder="Max Tokens (0 is INF)"
            value={threadConfig.data.completionParams.max_tokens}
            min={0}
            type="number"
            onChange={(e) =>
              setCompletionParams({
                max_tokens: e.target.valueAsNumber
              })
            }
          />

          <Input
            placeholder="Seed"
            value={threadConfig.data.completionParams.seed}
            min={0}
            type="number"
            onChange={(e) =>
              setCompletionParams({
                seed: e.target.valueAsNumber
              })
            }
          />

          <Input
            placeholder="Top K"
            value={threadConfig.data.completionParams.top_k}
            min={0}
            type="number"
            onChange={(e) =>
              setCompletionParams({
                top_k: e.target.valueAsNumber
              })
            }
          />
        </ViewBody>
      </ViewContainer>
    </ViewContainer>
  )
}
