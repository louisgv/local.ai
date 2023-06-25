import { cn } from "@lab/theme/utils"
import { SpinnerButton } from "@lab/ui/button"
import { Input } from "@lab/ui/input"
import { useState } from "react"

import { useGlobal } from "~providers/global"

export const ServerConfig = () => {
  const {
    concurrencyState: [concurrency, setConcurrency],
    serverStartedState: [isStarted],
    startServer,
    stopServer,
    portState: [port, setPort]
  } = useGlobal()

  const [isLoading, setIsLoading] = useState(false)
  return (
    <div className="flex items-center justify-end gap-2">
      {/* <Button
        onClick={async () => {
        }}>
        Test
      </Button> */}

      <Input
        className="w-24"
        disabled={isStarted}
        placeholder="Port"
        value={port}
        type="number"
        onChange={(e) => setPort(e.target.valueAsNumber || 0)}
      />
      <Input
        className="w-24"
        disabled={isStarted}
        placeholder="Concurrency"
        value={concurrency}
        type="number"
        onChange={(e) => setConcurrency(e.target.valueAsNumber || 0)}
      />
      <SpinnerButton
        isSpinning={isLoading}
        className={cn(
          "w-32 justify-center border",
          isStarted
            ? "border-red-7 hover:border-red-8 text-red-11 hover:text-red-12"
            : "border-green-9 hover:border-green-10 text-green-11 hover:text-green-12"
        )}
        onClick={async () => {
          setIsLoading(true)
          if (isStarted) {
            await stopServer()
          } else {
            await startServer()
          }
          setIsLoading(false)
        }}>
        {isLoading ? "..." : isStarted ? "Stop Server" : "Start Server"}
      </SpinnerButton>
    </div>
  )
}
