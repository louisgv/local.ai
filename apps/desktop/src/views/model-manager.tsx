import { cn } from "@localai/theme/utils"
import { Button, SpinnerButton } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import { ReloadIcon } from "@radix-ui/react-icons"
import { open as dialogOpen } from "@tauri-apps/api/dialog"
import { invoke } from "@tauri-apps/api/tauri"

import { ModelConfig } from "~features/inference-server/model-config"
import { ModelDigest } from "~features/inference-server/model-digest"
import { ServerConfig } from "~features/inference-server/server-config"
import { ViewBody, ViewContainer, ViewHeader } from "~features/layout/view"
import { type ModelMetadata, toGB } from "~features/model-downloader/model-file"
import { ModelSelector } from "~features/model-downloader/model-selector"
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
    activeModelState: [activeModel],
    modelsDirectoryState: {
      isRefreshing,
      modelsDirectory,
      models,
      updateModelsDirectory
    }
  } = useGlobal()

  return (
    <ViewContainer className="relative z-50">
      <ViewHeader>
        {!!modelsDirectory && (
          <SpinnerButton
            className="w-10 p-3"
            Icon={ReloadIcon}
            isSpinning={isRefreshing}
            title="Refresh Models Directory"
            onClick={async () => {
              await updateModelsDirectory()
            }}
          />
        )}
        <Input
          className="w-full"
          value={modelsDirectory}
          readOnly
          placeholder="Models directory">
          <Button
            className="w-6 h-4 absolute right-2 self-center text-gray-11 flex justify-center items-center"
            onClick={() => {
              invoke("open_directory", {
                path: modelsDirectory
              })
            }}>
            ...
          </Button>
        </Input>

        <Button
          className="w-24 justify-center"
          onClick={async () => {
            const selected = (await dialogOpen({
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
      <ViewBody className="flex flex-col p-8 gap-6">
        <ModelSelector />
        {models.length === 0 && (
          <p className="text-gray-9 italic pointer-events-none text-center">
            To start, download a model or change the models directory.
          </p>
        )}

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
              key={model.name}
              className={cn(
                "flex flex-col gap-4 rounded-md p-4",
                "text-gray-11 hover:text-gray-12",
                "transition-colors group",
                activeModel?.path === model.path
                  ? "ring ring-green-7 hover:ring-green-8"
                  : "ring ring-gray-7 hover:ring-gray-8"
              )}>
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
      </ViewBody>
    </ViewContainer>
  )
}
