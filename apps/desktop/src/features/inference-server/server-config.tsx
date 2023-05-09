import { SpinnerButton } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import { invoke } from "@tauri-apps/api/tauri"
import { useState } from "react"

import type { ModelMetadata } from "~pages"

export const ServerConfig = ({ model }: { model: ModelMetadata }) => {
  const [port, setPort] = useState("8000")
  const [endpoint, setEndpoint] = useState("")
  return (
    <div className="flex items-center justify-between w-full gap-2">
      <Input
        placeholder="Port"
        value={port}
        onChange={(e) => setPort(e.target.value)}
      />
      <Input
        placeholder="Endpoint"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
      />
      <SpinnerButton
        className="w-40 justify-center"
        onClick={async () => {
          invoke("start_server", { model, port: parseInt(port) })
        }}>
        Start Server
      </SpinnerButton>
    </div>
  )
}
