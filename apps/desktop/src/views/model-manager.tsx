import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import { ReloadIcon } from "@radix-ui/react-icons"
import { open } from "@tauri-apps/api/dialog"
import { invoke } from "@tauri-apps/api/tauri"
import { useState } from "react"

import {
  type ModelDirectoryState,
  type ModelMetadata,
  toGB
} from "~core/model-file"
import { ModelConfig } from "~features/inference-server/model-config"
import { ModelDigest } from "~features/inference-server/model-digest"
import { ServerConfig } from "~features/inference-server/server-config"
import { useInit } from "~features/inference-server/use-init"
import { ViewBody, ViewContainer, ViewHeader } from "~features/layout/view"
import { useGlobal } from "~providers/global"

// Flow: Pick a models directory

// For each model file in the directory, show an items with the following:
// - Model name
// - Model hash
// - Model description
// - Model size

// A button to "spawn" an inference server for the selected model

export function ModelManagerView() {
  const {
    activeModelState: [activeModel]
  } = useGlobal()
  const [modelsDirectory, setModelsDirectory] = useState("")
  const [models, setModels] = useState<ModelMetadata[]>([])

  useInit(async () => {
    // get the models directory saved in config
    const resp = await invoke<ModelDirectoryState>("initialize_models_dir")
    if (!resp) {
      return
    }
    setModelsDirectory(resp.path)
    setModels(resp.files)
  })

  async function updateModelsDirectory(dir: string) {
    const resp = await invoke<ModelDirectoryState>("update_models_dir", {
      dir
    })
    setModelsDirectory(resp.path)
    setModels(resp.files)
  }

  return (
    <ViewContainer>
      <ViewHeader>
        {!!modelsDirectory && (
          <button
            title="Refresh Models Directory"
            className="hover:text-gray-12"
            onClick={async () => {
              await updateModelsDirectory(modelsDirectory)
            }}>
            <ReloadIcon />
          </button>
        )}
        <Input
          className="w-full"
          value={modelsDirectory}
          readOnly
          placeholder="Models directory"
        />

        <Button
          className="w-24 justify-center"
          onClick={async () => {
            const selected = (await open({
              directory: true,
              multiple: false
            })) as string

            if (!selected) {
              return
            }
            await updateModelsDirectory(selected)
          }}>
          Change
        </Button>

        <ServerConfig />
      </ViewHeader>
      <ViewBody>
        {models.length === 0 && (
          <div className="h-full w-full flex flex-col justify-center items-center">
            <p className="text-gray-9 italic pointer-events-none">
              To start, download a model or change the models directory.
            </p>
          </div>
        )}
        <div className="flex flex-col gap-6 p-8">
          {models
            .sort((a: ModelMetadata, b: ModelMetadata) =>
              activeModel?.path === a.path
                ? -1
                : activeModel?.path === b.path
                ? 1
                : 0
            )
            .map((model: ModelMetadata) => (
              <div
                className={cn(
                  "flex flex-col gap-4 rounded-md p-4",
                  "text-gray-11 hover:text-gray-12",
                  "transition-colors",
                  activeModel?.path === model.path
                    ? "ring ring-green-7 hover:ring-green-8"
                    : "ring ring-gray-7 hover:ring-gray-8"
                )}
                key={model.name}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col justify-between w-full">
                    <div className={"text-md"}>{model.name}</div>
                    <div className="text-xs text-gray-10">
                      {`${toGB(model.size).toFixed(2)} GB`}
                    </div>
                  </div>
                  <ModelDigest model={model} />
                </div>
                <ModelConfig model={model} />
              </div>
            ))}
        </div>
      </ViewBody>
    </ViewContainer>
  )
}
