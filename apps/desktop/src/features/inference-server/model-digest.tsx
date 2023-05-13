import { Button, SpinnerButton } from "@localai/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect, useRef, useState } from "react"

import type { ModelMetadata } from "~core/model-file"
import { InitState, useInit } from "~features/inference-server/use-init"

type ModelDigest = {
  md5: string
  sha256: string
  blake3: string
}

const HashDisplay = ({ hashType = "", hashValue = "" }) => {
  return (
    <div className="flex justify-between gap-4">
      <label className="font-bold">{hashType}</label>
      <p>
        {hashValue.slice(0, 4)}...{hashValue.slice(-7)}
      </p>
    </div>
  )
}

export function ModelDigest({ model }: { model: ModelMetadata }) {
  const [digestHash, setDigestHash] = useState<ModelDigest>(null)
  const [isCalculating, setIsCalculating] = useState(false)

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
    <div
      // title="🚨 WARNING 🚨: hash computation is an intensive task, a 4GB model can take up to 5 minutes."
      className="flex justify-end text-gray-10 w-64">
      {digestHash ? (
        <div className="flex items-center gap-4 bg-gray-3 rounded-lg pl-4">
          <button className="hover:text-gray-12" onClick={computeDigest}>
            <ReloadIcon />
          </button>
          <button
            className="text-xs hover:bg-gray-4 p-2 rounded-md"
            onClick={() => {
              alert(`
              MD5:\n${digestHash.md5}
              ===
              SHA256:\n${digestHash.sha256}
              ===
              BLAKE3:\n${digestHash.blake3}
            `)
            }}>
            {["md5", "sha256"].map((hashType) => (
              <HashDisplay
                key={hashType}
                hashType={hashType.toUpperCase()}
                hashValue={digestHash[hashType]}
              />
            ))}
          </button>
        </div>
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
