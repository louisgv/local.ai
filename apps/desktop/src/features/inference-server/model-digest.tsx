import { cn } from "@localai/theme/utils"
import { SpinnerButton } from "@localai/ui/button"
import { CrossCircledIcon, ReloadIcon } from "@radix-ui/react-icons"
import { ShoppingCodeCheck } from "iconoir-react"
import { useEffect, useState } from "react"

import { InitState, useInit } from "~features/inference-server/use-init"
import { InvokeCommand, invoke } from "~features/invoke"
import type { ModelIntegrity } from "~features/invoke/model-integrity"
import type { ModelMetadata } from "~features/model-downloader/model-file"
import { DownloadState } from "~features/model-downloader/use-model-download"
import { useGlobal } from "~providers/global"
import { useModel } from "~providers/model"

export const getTruncatedHash = (hashValue: string) =>
  `${hashValue.slice(0, 4)}...${hashValue.slice(-7)}`

const HashDisplay = ({ hashType = "", hashValue = "", truncated = false }) => {
  return (
    <div className="flex justify-between gap-4 w-full">
      <label className="font-bold">{hashType}</label>
      <code className="break-all lg:break-normal">
        {truncated ? getTruncatedHash(hashValue) : hashValue}
      </code>
    </div>
  )
}

export const getCachedIntegrity = async (path: string) =>
  invoke(InvokeCommand.GetCachedIntegrity, {
    path
  }).catch<ModelIntegrity>(() => null)

export function ModelDigest({ model }: { model: ModelMetadata }) {
  const {
    knownModels: { modelMap }
  } = useGlobal()

  const { downloadState, updateModelConfig, updateModelType } = useModel()
  const [integrity, setIntegrity] = useState<ModelIntegrity>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const { initState } = useInit(async () => {
    const resp = await getCachedIntegrity(model.path)
    setIntegrity(resp)
  }, [model])

  useEffect(() => {
    if (downloadState === DownloadState.Completed) {
      getCachedIntegrity(model.path).then(setIntegrity)
    }
  }, [model, downloadState])

  async function computeDigest() {
    setIntegrity(null)
    setIsCalculating(true)
    try {
      const resp = await invoke(InvokeCommand.ComputeModelIntegrity, {
        path: model.path
      })
      setIntegrity(resp)

      const knownModelMetadata = modelMap[resp.blake3]
      if (!!knownModelMetadata) {
        alert(
          "Known model metadata found, updating model config:\n\n" +
            JSON.stringify(knownModelMetadata, null, 2)
        )
        updateModelType(knownModelMetadata.modelType)
        updateModelConfig({
          tokenizer: knownModelMetadata.tokenizers?.[0] || "", // Pick the first one for now
          defaultPromptTemplate: knownModelMetadata.promptTemplate || ""
        })
      } else {
        alert(
          "No known model metadata found. The model might need manual configuration."
        )
      }
    } catch (error) {
      alert(error)
    }

    setIsCalculating(false)
  }

  return (
    <div className="flex justify-end text-gray-10 w-64 relative">
      {integrity ? (
        <>
          <div
            className={cn(
              showDetail
                ? "z-10 opacity-100 pointer-events-auto"
                : "z-0 opacity-0 pointer-events-none",
              "absolute right-0 top-0",
              "transition-opacity",
              "w-64 sm:w-64 md:w-96 lg:w-auto",
              "text-xs sm:text-sm md:text-base"
            )}>
            <div
              className={cn(
                "bg-gray-4 relative px-5 py-4 rounded-lg border border-gray-6",
                "flex-wrap"
              )}>
              <button
                className="absolute right-1 top-1"
                onClick={() => setShowDetail(false)}>
                <CrossCircledIcon />
              </button>
              {["blake3", "sha256"].map((hashType) => (
                <HashDisplay
                  key={hashType}
                  hashType={hashType.toUpperCase()}
                  hashValue={integrity[hashType]}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pl-2 bg-gray-3 rounded-lg">
            <SpinnerButton
              className="w-10 p-3"
              isSpinning={isCalculating}
              Icon={ReloadIcon}
              onClick={computeDigest}
            />
            <button
              className="text-xs hover:bg-gray-4 p-2 rounded-md"
              onClick={() => {
                setShowDetail(true)
              }}>
              {["blake3", "sha256"].map((hashType) => (
                <HashDisplay
                  key={hashType}
                  truncated
                  hashType={hashType.toUpperCase()}
                  hashValue={integrity[hashType]}
                />
              ))}
            </button>
          </div>
        </>
      ) : (
        <SpinnerButton
          disabled={
            downloadState !== DownloadState.None &&
            downloadState !== DownloadState.Completed
          }
          isSpinning={isCalculating || initState === InitState.Initializing}
          onClick={computeDigest}
          Icon={ShoppingCodeCheck}>
          {isCalculating ? "Computing" : "Check Model"}
        </SpinnerButton>
      )}
    </div>
  )
}
