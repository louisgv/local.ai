import { cn } from "@localai/theme/utils"
import { Button, SpinnerButton } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import { open } from "@tauri-apps/api/dialog"
import { invoke } from "@tauri-apps/api/tauri"
import clsx from "clsx"

import "iconoir-react"

import { useEffect, useRef, useState } from "react"
import Balancer from "react-wrap-balancer"

import { ModelChecksum } from "~features/inference-server/model-checksum"
import { ModelConfig } from "~features/inference-server/model-config"
import { ServerConfig } from "~features/inference-server/server-config"

// Flow: Pick a models directory

// For each model file in the directory, show an items with the following:
// - Model name
// - Model hash
// - Model description
// - Model size

// A button to "spawn" an inference server for the selected model

type FileInfo = {
  name: string
  size: number
  path: string
}

export type ModelMetadata = FileInfo & {
  hash?: string
  label?: string
  description?: string
}

type ModelDirectoryState = {
  path: string
  files: FileInfo[]
}

function toGB(size: number) {
  return size / 1024 / 1024 / 1024
}

function IndexPage() {
  const [modelsDirectory, setModelsDirectory] = useState("")
  const [models, setModels] = useState<ModelMetadata[]>([])

  const initializedRef = useRef(false)
  useEffect(() => {
    if (initializedRef.current) {
      return
    }
    initializedRef.current = true
    // get the models directory saved in config
    async function init() {
      const resp = await invoke<ModelDirectoryState>("initialize_models_dir")
      if (!resp) {
        return
      }
      setModelsDirectory(resp.path)
      setModels(resp.files)
    }
    init()
  }, [])

  return (
    <div
      className={clsx(
        "h-full w-full flex flex-col gap-6 transition-all will-change-transform overflow-auto"
      )}>
      <div className="flex gap-2 sticky top-0 bg-gray-1 w-full p-8 z-50">
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

            const resp = await invoke<ModelDirectoryState>(
              "update_models_dir",
              {
                dir: selected
              }
            )
            setModelsDirectory(resp.path)
            setModels(resp.files)
          }}>
          Change
        </Button>
        <ServerConfig />
      </div>

      <div className="flex flex-col gap-6 p-8 bg-gray-2 h-full">
        {models.map((model: ModelMetadata) => (
          <div
            className={cn(
              "flex flex-col gap-4 rounded-md p-4",
              "text-gray-11 hover:text-gray-12",
              "transition-colors",
              "ring ring-gray-7 hover:ring-gray-8"
            )}
            key={model.name}>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col justify-between w-full">
                <div className={"text-md"}>{model.name}</div>
                <div className="text-xs text-gray-10">
                  {`${toGB(model.size).toFixed(2)} GB`}
                </div>
              </div>
              <ModelChecksum model={model} />
            </div>
            <ModelConfig model={model} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default IndexPage
