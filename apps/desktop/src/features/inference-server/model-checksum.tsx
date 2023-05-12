import { Button, SpinnerButton } from "@localai/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect, useRef, useState } from "react"

import type { ModelMetadata } from "~core/model-file"
import { InitState, useInit } from "~features/inference-server/use-init"

export function ModelChecksum({ model }: { model: ModelMetadata }) {
  const [checksumHash, setChecksumHash] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)

  const { initState } = useInit(async () => {
    const resp = await invoke<string>("get_cached_hash", {
      path: model.path
    }).catch(() => null)

    if (!!resp) {
      setChecksumHash(resp)
    }
  }, [model])

  async function getChecksum() {
    setChecksumHash("")
    setIsCalculating(true)
    const resp = await invoke<string>("get_hash", {
      path: model.path
    })
    if (!!resp) {
      setChecksumHash(resp)
    }

    setIsCalculating(false)
  }

  return (
    <div className="flex justify-end text-gray-10 w-64">
      {checksumHash ? (
        <div className="flex items-center gap-2">
          <ReloadIcon className="hover:text-gray-12" onClick={getChecksum} />
          <p>{checksumHash}</p>
        </div>
      ) : (
        <SpinnerButton
          isSpinning={isCalculating || initState === InitState.Initializing}
          onClick={getChecksum}>
          {isCalculating ? "Calculating" : "Get Checksum"}
        </SpinnerButton>
      )}
    </div>
  )
}
