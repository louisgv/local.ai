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
import { useState } from "react"
import Balancer from "react-wrap-balancer"

import { modelList, modelMap } from "~core/model-metadata"

export const ModelSelector = () => {
  const [selectedModelHash, setSelectedModelHash] = useState<string>()

  return (
    <div className="flex gap-2 w-full">
      <Select value={selectedModelHash} onValueChange={setSelectedModelHash}>
        <SelectTrigger
          className={cn(
            "w-4/5",
            selectedModelHash ? "text-gray-12" : "text-gray-11"
          )}>
          <SelectValue aria-label={modelMap[selectedModelHash].md5Hash}>
            {modelMap[selectedModelHash]?.downloadUrl.split("/").pop() ||
              "Select a Model to download"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="flex h-48 w-full">
          {modelList.map((model) => (
            <SelectItem key={model.downloadUrl} value={model.md5Hash}>
              <div className="text-md w-full">
                <div className="flex items-center justify-between w-full">
                  <div
                    className={cn(
                      "w-full",
                      selectedModelHash === model.md5Hash
                        ? "text-gray-12"
                        : "text-gray-11"
                    )}>
                    {model.downloadUrl.split("/").pop()}
                  </div>

                  <div className="text-xs text-gray-10 w-24">
                    {model.md5Hash}
                  </div>
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
        className="w-1/5"
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
