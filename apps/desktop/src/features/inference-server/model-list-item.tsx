import { cn } from "@localai/theme/utils"

import { ModelConfig } from "~features/inference-server/model-config"
import { ModelDigest } from "~features/inference-server/model-digest"
import { InfoMenu } from "~features/inference-server/model-info"
import { type ModelMetadata } from "~features/model-downloader/model-file"
import { useGlobal } from "~providers/global"
import { ModelProvider, useModel } from "~providers/model"

const ModelLabel = () => {
  const { model } = useModel()
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="flex items-center">
        <div className="text-md">{model.name}</div> {/* Model name */}
        <InfoMenu /> {/* Render InfoMenu component */}
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
        <div className="flex items-center justify-between w-full">
          <ModelLabel />
          <ModelDigest model={model} />
        </div>
        <ModelConfig />
      </div>
    </ModelProvider>
  )
}
