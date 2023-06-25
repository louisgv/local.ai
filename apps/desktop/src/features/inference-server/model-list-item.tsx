import { cn } from "@lab/theme/utils"

import { ModelConfig } from "~features/inference-server/model-config"
import { ModelDigest } from "~features/inference-server/model-digest"
import { ModelInfo } from "~features/inference-server/model-info"
import { useToggle } from "~features/layout/use-toggle"
import { type ModelMetadata, toGB } from "~features/model-downloader/model-file"
import { useGlobal } from "~providers/global"
import { ModelProvider, useModel } from "~providers/model"

const ModelLabel = () => {
  const { model, modelSize } = useModel()
  const [showByte, toggleShowByte] = useToggle()

  return (
    <div className="flex flex-col w-full justify-start">
      <div className="flex text-md gap-2">
        <span>{model.name}</span>
        <ModelInfo />
      </div>
      <div className="flex text-xs items-center text-gray-10 gap-1">
        <span>{showByte ? modelSize : toGB(modelSize).toFixed(2)}</span>
        <button className="hover:text-gray-11" onClick={toggleShowByte}>
          {showByte ? `B` : `GB`}
        </button>
      </div>
    </div>
  )
}

export const ModelListItem = ({ model }: { model: ModelMetadata }) => {
  const {
    activeModelState: [activeModel]
  } = useGlobal()
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
          <ModelLabel />
          <ModelDigest />
        </div>
        <ModelConfig />
      </div>
    </ModelProvider>
  )
}
