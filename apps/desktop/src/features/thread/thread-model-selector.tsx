import { cn } from "@lab/theme/utils"
import { CornerLabel } from "@lab/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@lab/ui/select"
import { useState } from "react"

import { useGlobal } from "~providers/global"
import { useThread } from "~providers/thread"

export const ThreadModelSelector = () => {
  const {
    modelsDirectoryState: { models, modelsMap }
  } = useGlobal()

  const { threadModel, threadConfig } = useThread()

  const [isUpdating, setIsUpdating] = useState(false)
  return (
    <Select
      disabled={isUpdating}
      value={threadModel.name}
      onValueChange={async (name) => {
        setIsUpdating(true)
        const model = modelsMap.name.get(name)
        await threadConfig.update({
          modelPath: model.path
        })
        setIsUpdating(false)
      }}>
      <SelectTrigger
        className={cn(
          "text-gray-11",
          "relative",
          "w-64 flex flex-grow-0 flex-shrink-0 group"
        )}>
        <CornerLabel>Model</CornerLabel>

        <SelectValue>
          <div className="w-52 overflow-hidden text-left">
            {threadModel ? (
              <span className="w-[calc(100%)] block whitespace-nowrap group-hover:animate-scroll-x group-hover:w-max">
                {threadModel.name}
              </span>
            ) : (
              "Select a model to load"
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="flex h-48 w-full">
        {models.map((model) => (
          <SelectItem key={model.path} value={model.name}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
