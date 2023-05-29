import { cn } from "@localai/theme/utils"
import { SpinnerButton } from "@localai/ui/button"
import { CrossCircledIcon, ReloadIcon } from "@radix-ui/react-icons"
import { invoke } from "@tauri-apps/api/tauri"
import { useState } from "react"

import { InitState, useInit } from "~features/inference-server/use-init"
import type { ModelMetadata } from "~features/model-downloader/model-file"

type ModelDigest = {
  md5: string
  sha256: string
  blake3: string
}

export const getTruncatedHash = (hashValue: string) =>
  `${hashValue.slice(0, 4)}...${hashValue.slice(-7)}`

const HashDisplay = ({ hashType = "", hashValue = "", truncated = false }) => {
  return (
    <div className="flex justify-between gap-4">
      <label className="font-bold">{hashType}</label>
      <code>{truncated ? getTruncatedHash(hashValue) : hashValue}</code>
    </div>
  )
}

export function ModelDigest({ model }: { model: ModelMetadata }) {
  const [digestHash, setDigestHash] = useState<ModelDigest>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const { initState } = useInit(async () => {
    const resp = await invoke<ModelDigest>("get_cached_integrity", {
      path: model.path
    }).catch(() => null)

    setDigestHash(resp)
  }, [model])

  async function computeDigest() {
    setDigestHash(null)
    setIsCalculating(true)
    try {
      const resp = await invoke<ModelDigest>("get_integrity", {
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
              "absolute right-0 top-0",
              "transition-opacity",
              showDetail
                ? "z-10 opacity-100 pointer-events-auto"
                : "z-0 opacity-0 pointer-events-none"
            )}>
            <div className="bg-gray-4 relative px-5 py-4 rounded-lg border border-gray-6">
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
          isSpinning={isCalculating || initState === InitState.Initializing}
          onClick={computeDigest}>
          {isCalculating ? "Computing" : "Get Hashes"}
        </SpinnerButton>
      )}
    </div>
  )
}
