import { cn } from "@localai/theme/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@localai/ui/select"
import { ModelType } from "@models/_shared"
import { useState } from "react"

import { getModelType } from "~features/inference-server/use-model-type"
import { useGlobal } from "~providers/global"

export const QuickModelLoaderSelector = () => {
  const {
    activeModelState: [activeModel],
    modelsDirectoryState: { models, modelsMap },
    loadModel
  } = useGlobal()

  const [selectedModel, setSelectedModel] = useState(activeModel)
  const [isRefreshing, setIsRefreshing] = useState(false)
  return (
    <Select
      disabled={isRefreshing}
      value={selectedModel?.name}
      onValueChange={async (name) => {
        setIsRefreshing(true)

        const model = modelsMap.get(name)
        setSelectedModel(model)

        try {
          const modelType = (await getModelType(model)) || ModelType.Llama
          await loadModel(model, modelType)
        } catch (error) {
          alert(error)
        }

        setIsRefreshing(false)
      }}>
      <SelectTrigger
        className={cn(
          "text-gray-11",
          "relative",
          "w-64 flex flex-grow-0 flex-shrink-0"
        )}>
        <label
          className={cn(
            "absolute -top-2 right-2 text-xs bg-gray-3 px-2 py-px rounded-md transition-opacity z-50 text-ellipsis whitespace-nowrap"
          )}>
          Model
        </label>

        <SelectValue>
          <span className="flex w-52">
            {selectedModel?.name || "Select a model to load"}
          </span>
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
