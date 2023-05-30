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
import {
  modelList,
  modelMap
} from "~features/model-downloader/model-download-list"

export const ModelSelector = () => {
  const [selectedModelHash, setSelectedModelHash] = useState<string>()

  const selectedModel = useMemo(
    () => modelMap[selectedModelHash],
    [selectedModelHash]
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
                <span
                  className="text-sm text-ellipsis text-gray-10"
                  style={{
                    fontFamily: "monospace"
                  }}>
                  ({getTruncatedHash(selectedModel.blake3)})
                </span>
              </div>
            ) : (
              <span>Select a Model to download</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="flex h-96 w-full">
          {modelList.map((model) => (
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

                  <span
                    className="text-ellipsis text-gray-10"
                    style={{
                      fontFamily: "monospace"
                    }}>
                    {getTruncatedHash(model.blake3)}
                  </span>
                </div>
                <p>
                  <Balancer>{model.description}</Balancer>
                </p>
                <div className="flex flex-wrap gap-2">
                  {model.licenses.map((license) => (
                    <span
                      key={license}
                      className="px-2 py-1 rounded-lg bg-gray-6">
                      {license}
                    </span>
                  ))}
                </div>
                <p className="text-gray-10">{model.downloadUrl}</p>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SpinnerButton
        Icon={DownloadIcon}
        disabled={!selectedModelHash}
        // isSpinning
        onClick={() => {
          invoke("download_model", modelMap[selectedModelHash])
        }}>
        Download
      </SpinnerButton>
    </div>
  )
}
