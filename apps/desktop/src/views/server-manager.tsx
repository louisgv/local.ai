import { Button, SpinnerButton } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import {
  DotsHorizontalIcon,
  OpenInNewWindowIcon,
  ReloadIcon
} from "@radix-ui/react-icons"
import { open as dialogOpen } from "@tauri-apps/api/dialog"

import { InstanceCreator } from "~features/inference-server/instance-creator"
import { ServerConfig } from "~features/inference-server/server-config"
import { ServerListItem } from "~features/inference-server/server-list-item"
import { InvokeCommand, invoke } from "~features/invoke"
import { ViewBody, ViewContainer, ViewHeader } from "~features/layout/view"
import { ModelSelector } from "~features/model-downloader/model-selector"
import { ChatSideBarToggle } from "~features/thread/side-bar"
import { useGlobal } from "~providers/global"

// Flow: Pick a models directory

// For each model file in the directory, show an items with the following:
// - Model name
// - Model hash
// - Model description
// - Model size

// A button to "spawn" an inference server for the selected model

export function ServerManagerView() {
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
        <ChatSideBarToggle />
        <div className="flex w-full">
          {!!modelsDirectory && (
            <SpinnerButton
              className="w-10 p-3 rounded-r-none"
              Icon={ReloadIcon}
              isSpinning={isRefreshing}
              title="Refresh Server Instance Directory"
              onClick={async () => {
                await updateModelsDirectory()
              }}
            />
          )}
          <Input
            className="w-full lg:w-96 rounded-none border-gray-3"
            value={modelsDirectory}
            readOnly
            placeholder="Server directory"
          />

          <Button
            title="Change server directory"
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
            title="Open server directory"
            className="w-10 p-3 rounded-l-none"
            onClick={() => {
              invoke(InvokeCommand.OpenDirectory, {
                path: modelsDirectory
              })
            }}>
            <OpenInNewWindowIcon />
          </Button>
        </div>
        <InstanceCreator />
      </ViewHeader>
      <ViewBody className="flex flex-col p-4 gap-2">
        {models.length === 0 && (
          <p className="text-gray-9 italic pointer-events-none text-center">
            {`Here you can create and save custom instances of your models to use as servers. To begin, just click the "+" button.`}
          </p>
        )}
        <div className="flex flex-col p-2 gap-6">
          {models
            .sort((a, b) =>
              activeModel?.path === a.path
                ? -1
                : activeModel?.path === b.path
                ? 1
                : 0
            )
            .map((model) => (
              <ServerListItem key={model.name} model={model} />
            ))}
        </div>
      </ViewBody>
    </ViewContainer>
  )
}
