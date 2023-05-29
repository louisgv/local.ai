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
          <SelectValue aria-label={selectedModel?.md5Hash}>
            {selectedModel ? (
              <div className="flex gap-2 items-center">
                <span>{selectedModel.downloadUrl.split("/").pop()}</span>
                <span
                  className="text-sm text-ellipsis text-gray-10"
                  style={{
                    fontFamily: "monospace"
                  }}>
                  ({selectedModel.md5Hash})
                </span>
              </div>
            ) : (
              <span>Select a Model to download</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="flex h-48 w-full">
          {modelList.map((model) => (
            <SelectItem key={model.downloadUrl} value={model.md5Hash}>
              <div className="flex flex-col gap-2 text-md w-full">
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "w-full text-lg",
                      selectedModelHash === model.md5Hash
                        ? "text-gray-12"
                        : "text-gray-11"
                    )}>
                    {model.downloadUrl.split("/").pop()}
                  </span>

                  <span
                    className="text-xs text-ellipsis text-gray-10"
                    style={{
                      fontFamily: "monospace"
                    }}>
                    {getTruncatedHash(model.md5Hash)}
                  </span>
                </div>
                <p className="text-xs">
                  <Balancer>{model.description}</Balancer>
                </p>
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
