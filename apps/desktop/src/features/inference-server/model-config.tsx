import { cn } from "@localai/theme/utils"
import { SpinnerButton } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@localai/ui/select"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect, useState } from "react"

import type { ModelMetadata } from "~core/model-file"
import { useInit } from "~features/inference-server/use-init"
import { useGlobal } from "~providers/global"

export enum ModelType {
  Llama = "llama",
  GptJ = "gptj",
  Mpt = "mpt",
  NeoX = "neox",
  RedPajama = "redpajama",
  Bloom = "bloom",
  Gpt2 = "gpt2"
}

const modelTypeList = Object.values(ModelType)

export enum ModelLoadState {
  Default,
  Loading,
  Loaded
}

export const ModelConfig = ({ model }: { model: ModelMetadata }) => {
  const [label, setLabel] = useState("")
  const {
    activeModelState: [activeModel, setActiveModel]
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
    }
  }, [activeModel, model])

  return (
    <div className="flex items-center justify-between w-full gap-2">
      <Input
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <SpinnerButton
        isSpinning={modelLoadState === ModelLoadState.Loading}
        disabled={modelLoadState === ModelLoadState.Loaded}
        onClick={async () => {
          await invoke("test_model", {
            ...model,
            modelType,
            label
          })
        }}>
        Test Model
      </SpinnerButton>
      <div className="flex items-center justify-end w-96 gap-2">
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
                label
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
