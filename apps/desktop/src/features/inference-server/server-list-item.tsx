import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import { Textarea } from "@localai/ui/textarea"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GearIcon
} from "@radix-ui/react-icons"
import dedent from "ts-dedent"

import { useToggle } from "~features/layout/use-toggle"
import { type ModelMetadata } from "~features/model-downloader/model-file"
import { useGlobal } from "~providers/global"
import { ModelProvider } from "~providers/model"

import { ServerConfig } from "./server-config"

export const ServerListItem = ({ model }: { model: ModelMetadata }) => {
  const {
    activeModelState: [activeModel]
  } = useGlobal()
  const [isConfigVisible, toggleConfig] = useToggle(false)
  return (
    <ModelProvider model={model}>
      <div
        className={cn(
          "flex flex-col gap-4 rounded-md p-2 pl-3",
          "text-gray-11 hover:text-gray-12",
          "transition-colors group",
          activeModel?.path === model.path
            ? "border border-green-7 hover:border-green-8"
            : "border border-gray-7 hover:border-gray-8"
        )}>
        <div className="flex justify-between w-full">
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
        </div>
        <ServerConfig />
        {isConfigVisible && (
          <>
            <div
              className={cn(
                "transition-all",
                isConfigVisible ? "w-1/4 opacity-100" : "w-0 opacity-0",
                "border-l border-l-gray-6"
              )}>
              <div className="p-4 flex flex-col gap-6 overflow-auto items-start w-full">
                <Textarea
                  rows={8}
                  title="Prompt template (WIP)"
                  defaultValue={dedent`
                  <BOT>: {SYSTEM}
                  <HUMAN>: {PROMPT}
                  <BOT>:
                `}
                />
                <Input placeholder="Temperature (WIP)" defaultValue={0.47} />
                <Input placeholder="Max Tokens (WIP)" defaultValue={0.47} />
              </div>
            </div>
          </>
        )}
      </div>
    </ModelProvider>
  )
}
