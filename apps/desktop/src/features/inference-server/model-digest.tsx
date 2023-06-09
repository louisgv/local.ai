import { cn } from "@localai/theme/utils"
import { SpinnerButton } from "@localai/ui/button"
import { CrossCircledIcon, ReloadIcon } from "@radix-ui/react-icons"
import { invoke } from "@tauri-apps/api/tauri"
import { ShoppingCodeCheck } from "iconoir-react"
import { useEffect, useState } from "react"

import { InitState, useInit } from "~features/inference-server/use-init"
import type { ModelMetadata } from "~features/model-downloader/model-file"
import { DownloadState } from "~features/model-downloader/use-model-download"
import { useModel } from "~providers/model"

type ModelDigest = {
  md5: string
  sha256: string
  blake3: string
}

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
  invoke<ModelDigest>("get_cached_integrity", {
    path
  }).catch<ModelDigest>(() => null)

export function ModelDigest({ model }: { model: ModelMetadata }) {
  const { downloadState } = useModel()
  const [digestHash, setDigestHash] = useState<ModelDigest>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const { initState } = useInit(async () => {
    const resp = await getCachedIntegrity(model.path)
    setDigestHash(resp)
  }, [model])

  useEffect(() => {
    if (downloadState === DownloadState.Completed) {
      getCachedIntegrity(model.path).then(setDigestHash)
    }
  }, [model, downloadState])

  async function computeDigest() {
    setDigestHash(null)
    setIsCalculating(true)
    try {
      const resp = await invoke<ModelDigest>("compute_model_integrity", {
        path: model.path
      })
      setDigestHash(resp)
    } catch (error) {
      alert(error)
    }

    setIsCalculating(false)
  }

  return (
    <div className="flex justify-end text-gray-10 w-64 relative">
      {digestHash ? (
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
                  hashValue={digestHash[hashType]}
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
                  hashValue={digestHash[hashType]}
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
          {isCalculating ? "Computing" : "Get Hashes"}
        </SpinnerButton>
      )}
    </div>
  )
}
