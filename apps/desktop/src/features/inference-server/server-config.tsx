import { cn } from "@localai/theme/utils"
import { SpinnerButton } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import { invoke } from "@tauri-apps/api/tauri"
import { useState } from "react"

export const ServerConfig = () => {
  const [port, setPort] = useState(8080)
  const [isStarted, setIsStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  return (
    <div className="flex items-center justify-between w-full gap-2">
      <Input
        disabled={isStarted}
        placeholder="Port"
        value={port}
        onChange={(e) => setPort(e.target.valueAsNumber)}
      />
      <SpinnerButton
        isSpinning={isLoading}
        className={cn(
          "w-32 justify-center",
          isStarted
            ? "border-red-7 hover:border-red-8 text-red-11 hover:text-red-12"
            : "border-green-9 hover:border-green-10 text-green-11 hover:text-green-12"
        )}
        onClick={async () => {
          setIsLoading(true)
          if (isStarted) {
            await invoke("stop_server")
            setIsStarted(false)
          } else {
            await invoke("start_server", { port })
            setIsStarted(true)
          }
          setIsLoading(false)
        }}>
        {isStarted ? "Stop Server" : "Start Server"}
      </SpinnerButton>
    </div>
  )
}
