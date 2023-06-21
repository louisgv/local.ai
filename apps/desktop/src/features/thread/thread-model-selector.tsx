import { cn } from "@localai/theme/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@localai/ui/select"
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
        <label
          className={cn(
            "absolute -top-2 right-2 text-xs bg-gray-3 px-2 py-px rounded-md transition-opacity z-50 text-ellipsis whitespace-nowrap"
          )}>
          Model
        </label>

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
