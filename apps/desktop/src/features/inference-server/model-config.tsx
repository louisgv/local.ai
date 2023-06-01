import { cn } from "@localai/theme/utils"
import { SpinnerButton } from "@localai/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@localai/ui/select"
import { modelTypeList } from "@models/index"
import { TrashIcon } from "@radix-ui/react-icons"
import { invoke } from "@tauri-apps/api/tauri"
import { useMemo, useState } from "react"

import { DownloadProgress } from "~features/model-downloader/download-progress"
import { DownloadState } from "~features/model-downloader/use-model-download"
import { useGlobal } from "~providers/global"
import { ModelLoadState, useModel } from "~providers/model"

const TestModelButton = () => {
  const { model, modelType } = useModel()

  const [isTesting, setIsTesting] = useState(false)

  return (
    <SpinnerButton
      className="text-yellow-9"
      isSpinning={isTesting}
      onClick={async () => {
        setIsTesting(true)
        await invoke("test_model", {
          ...model,
          modelType
        })
        setIsTesting(false)
      }}>
      Test Model
    </SpinnerButton>
  )
}

export const ModelConfig = () => {
  const {
    modelsDirectoryState: { updateModelsDirectory }
  } = useGlobal()

  const {
    model,
    modelType,
    modelLoadState,
    updateModelType: setModelType,
    loadModel,
    downloadState
  } = useModel()

  const isDownloadDone = useMemo(
    () =>
      downloadState !== DownloadState.None &&
      downloadState !== DownloadState.Completed,
    [downloadState]
  )

  return (
    <div className="flex items-center justify-between w-full gap-2 group">
      {/* <Input
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      /> */}
      <div className="flex gap-2">
        <SpinnerButton
          className={cn(
            "group-hover:opacity-100 opacity-0 transition-opacity",
            downloadState === DownloadState.Downloading ? "hidden" : "block"
          )}
          Icon={TrashIcon}
          onClick={async () => {
            await invoke("delete_model_file", {
              path: model.path
            })

            await updateModelsDirectory()
          }}
          disabled={modelLoadState === ModelLoadState.Loaded}
        />
        <DownloadProgress />
      </div>
      <div className="flex items-center justify-end w-96 gap-2">
        {/* <TestModelButton model={model} modelType={modelType} /> */}
        <Select value={modelType} onValueChange={setModelType}>
          <SelectTrigger className={cn("text-gray-11", "w-24")}>
            <SelectValue aria-label={modelType}>{modelType}</SelectValue>
          </SelectTrigger>
          <SelectContent className="flex h-48 w-full">
            {modelTypeList.map((mt) => (
              <SelectItem key={mt} value={mt}>
                {mt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <SpinnerButton
          isSpinning={modelLoadState === ModelLoadState.Loading}
          disabled={
            modelLoadState === ModelLoadState.Loaded ||
            (downloadState !== DownloadState.None &&
              downloadState !== DownloadState.Completed)
          }
          onClick={loadModel}>
          {modelLoadState === ModelLoadState.Loaded ? "Loaded" : "Load Model"}
        </SpinnerButton>
      </div>
    </div>
  )
}
