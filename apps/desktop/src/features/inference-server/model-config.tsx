import { cn } from "@localai/theme/utils"
import { Button, SpinnerButton } from "@localai/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@localai/ui/select"
import { TrashIcon } from "@radix-ui/react-icons"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect, useState } from "react"

import { useInit } from "~features/inference-server/use-init"
import {
  type ModelMetadata,
  ModelType,
  modelTypeList
} from "~features/model-downloader/model-file"
import { useGlobal } from "~providers/global"

export enum ModelLoadState {
  Default,
  Loading,
  Loaded
}

const TestModelButton = ({
  model,
  modelType
}: {
  model: ModelMetadata
  modelType: ModelType
}) => {
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

export const ModelConfig = ({ model }: { model: ModelMetadata }) => {
  const {
    activeModelState: [activeModel, setActiveModel],
    concurrencyState: [concurrency],
    modelsDirectoryState: { updateModelsDirectory }
  } = useGlobal()
  // TODO: Cache the model type in a kv later
  const [modelType, setModelType] = useState<ModelType>(ModelType.GptJ)
  const [modelLoadState, setModelLoadState] = useState<ModelLoadState>(
    ModelLoadState.Default
  )

  useInit(async () => {
    const resp = await invoke<string>("get_cached_model_type", {
      path: model.path
    }).catch(() => null)

    if (!!resp) {
      setModelType(resp)
    }
  }, [model])

  useEffect(() => {
    if (activeModel?.path !== model.path) {
      setModelLoadState(ModelLoadState.Default)
    } else {
      setModelLoadState(ModelLoadState.Loaded)
    }
  }, [activeModel, model])

  return (
    <div className="flex items-center justify-between w-full gap-2 group">
      {/* <Input
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      /> */}
      <div>
        <SpinnerButton
          Icon={TrashIcon}
          onClick={async () => {
            await invoke("delete_model_file", {
              path: model.path
            })

            await updateModelsDirectory()
          }}
          disabled={modelLoadState === ModelLoadState.Loaded}
          className="group-hover:opacity-100 opacity-0 transition-opacity"
        />
      </div>
      <div className="flex items-center justify-end w-96 gap-2">
        {/* <TestModelButton model={model} modelType={modelType} /> */}
        <Select
          value={modelType}
          onValueChange={(s: ModelType) => {
            setModelType(s)
            invoke("set_model_type", {
              path: model.path,
              modelType: s
            })
          }}>
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
          disabled={modelLoadState === ModelLoadState.Loaded}
          onClick={async () => {
            setModelLoadState(ModelLoadState.Loading)
            try {
              await invoke("load_model", {
                ...model,
                modelType,
                modelVocabulary: {},
                concurrency
              })
              setActiveModel(model)
              setModelLoadState(ModelLoadState.Loaded)
            } catch (error) {
              alert(error)
              setModelLoadState(ModelLoadState.Default)
            }
          }}>
          {modelLoadState === ModelLoadState.Loaded ? "Loaded" : "Load Model"}
        </SpinnerButton>
      </div>
    </div>
  )
}
