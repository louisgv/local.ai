import { Button, SpinnerButton } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import {
  DotsHorizontalIcon,
  OpenInNewWindowIcon,
  ReloadIcon
} from "@radix-ui/react-icons"
import { open as dialogOpen } from "@tauri-apps/api/dialog"
import { invoke } from "@tauri-apps/api/tauri"

import { ModelListItem } from "~features/inference-server/model-list-item"
import { ServerConfig } from "~features/inference-server/server-config"
import { ViewBody, ViewContainer, ViewHeader } from "~features/layout/view"
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
        <div className="flex w-full">
          {!!modelsDirectory && (
            <SpinnerButton
              className="w-10 p-3 rounded-r-none"
              Icon={ReloadIcon}
              isSpinning={isRefreshing}
              title="Refresh Models Directory"
              onClick={async () => {
                await updateModelsDirectory()
              }}
            />
          )}
          <Input
            className="w-full lg:w-96 rounded-none border-gray-3"
            value={modelsDirectory}
            readOnly
            placeholder="Models directory"
          />

          <Button
            title="Change models directory"
            className="w-10 p-3 rounded-none"
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
            <DotsHorizontalIcon />
          </Button>

          <Button
            title="Open models directory"
            className="w-10 p-3 rounded-l-none"
            onClick={() => {
              invoke("open_directory", {
                path: modelsDirectory
              })
            }}>
            <OpenInNewWindowIcon />
          </Button>
        </div>

        <ServerConfig />
      </ViewHeader>
      <ViewBody className="flex flex-col p-8 gap-6">
        <ModelSelector />
        {models.length === 0 && (
          <p className="text-gray-9 italic pointer-events-none text-center">
            {`To start, download a model or change the models directory by
            clicking the "..." button.`}
          </p>
        )}

        {models
          .sort((a, b) =>
            activeModel?.path === a.path
              ? -1
              : activeModel?.path === b.path
              ? 1
              : 0
          )
          .map((model) => (
            <ModelListItem key={model.name} model={model} />
          ))}
      </ViewBody>
    </ViewContainer>
  )
}
