import { cn } from "@localai/theme/utils"
import { SpinnerButton } from "@localai/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@localai/ui/select"
import { DownloadIcon } from "@radix-ui/react-icons"
import { invoke } from "@tauri-apps/api/tauri"
import { useMemo, useState } from "react"
import Balancer from "react-wrap-balancer"

import { getTruncatedHash } from "~features/inference-server/model-digest"
import { toGB } from "~features/model-downloader/model-file"
import { useModelsApi } from "~features/model-downloader/use-models-api"
import { useGlobal } from "~providers/global"

export const ModelSelector = () => {
  const {
    modelsDirectoryState: { updateModelsDirectory }
  } = useGlobal()

  const { models, modelMap } = useModelsApi()

  const [selectedModelHash, setSelectedModelHash] = useState<string>()

  const [isDownloading, setIsDownloading] = useState(false)

  const selectedModel = useMemo(
    () => modelMap[selectedModelHash],
    [modelMap, selectedModelHash]
  )

  return (
    <div className="flex gap-2 w-full">
      <Select value={selectedModelHash} onValueChange={setSelectedModelHash}>
        <SelectTrigger
          className={cn(
            "w-full",
            selectedModelHash ? "text-gray-12" : "text-gray-11"
          )}>
          <SelectValue aria-label={selectedModel?.blake3}>
            {selectedModel ? (
              <div className="flex gap-2 items-center">
                <span>{selectedModel.name}</span>
                <code className="text-sm text-ellipsis text-gray-10">
                  ({getTruncatedHash(selectedModel.blake3)})
                </code>
              </div>
            ) : (
              <span>Select a Model to download</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="flex h-96 w-full">
          {models.map((model) => (
            <SelectItem key={model.downloadUrl} value={model.blake3}>
              <div className={cn("flex flex-col gap-2 text-md w-full text-xs")}>
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "w-full text-lg",
                      selectedModelHash === model.blake3 ? "text-gray-12" : null
                    )}>
                    {model.name}
                  </span>

                  <span className="flex flex-col items-end">
                    <code className="text-ellipsis text-gray-10">
                      {getTruncatedHash(model.blake3)}
                    </code>
                    <div className="italic">
                      {toGB(model.size).toFixed(2)} GB
                    </div>
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <p>
                    <Balancer>{model.description}</Balancer>
                  </p>
                  <code className="text-gray-10 break-all">
                    <Balancer>{model.downloadUrl}</Balancer>
                  </code>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {model.licenses.map((license) => (
                      <span
                        key={license}
                        className="px-2 py-1 rounded-lg bg-gray-6">
                        {license}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SpinnerButton
        Icon={DownloadIcon}
        disabled={!selectedModelHash}
        isSpinning={isDownloading}
        onClick={async () => {
          setIsDownloading(true)
          await invoke("start_download", {
            name: selectedModel.name,
            downloadUrl: selectedModel.downloadUrl,
            digest: selectedModel.blake3,
            modelType: selectedModel.modelType
          })
          setSelectedModelHash(undefined)

          await updateModelsDirectory()
          setIsDownloading(false)
        }}>
        Download
      </SpinnerButton>
    </div>
  )
}
