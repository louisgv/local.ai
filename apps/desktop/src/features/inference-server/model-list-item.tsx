import { cn } from "@localai/theme/utils"

import { ModelConfig } from "~features/inference-server/model-config"
import { ModelDigest } from "~features/inference-server/model-digest"
import { useToggle } from "~features/layout/use-toggle"
import { type ModelMetadata, toGB } from "~features/model-downloader/model-file"
import { useGlobal } from "~providers/global"
import { ModelProvider, useModel } from "~providers/model"

const ModelLabel = () => {
  const { model, modelSize } = useModel()
  const [showByte, toggleShowByte] = useToggle()
  return (
    <div className="flex flex-col justify-between w-full">
      <div className={"text-md"}>{model.name}</div>
      <button className="flex text-xs text-gray-10" onClick={toggleShowByte}>
        {showByte ? `${modelSize} B` : `${toGB(modelSize).toFixed(2)} GB`}
      </button>
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
        <div className="flex items-center justify-between w-full">
          <ModelLabel />
          <ModelDigest model={model} />
        </div>
        <ModelConfig />
      </div>
    </ModelProvider>
  )
}
