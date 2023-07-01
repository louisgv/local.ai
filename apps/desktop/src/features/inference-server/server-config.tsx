import { cn } from "@lab/theme/utils"
import { SpinnerButton } from "@lab/ui/button"
import { IntInput } from "@lab/ui/int-input"
import { Switch } from "@lab/ui/switch"
import { useState } from "react"

import { useGlobal } from "~providers/global"

export const ServerConfig = () => {
  const {
    serverConfig,
    serverStartedState: [isStarted],
    startServer,
    stopServer
  } = useGlobal()

  const [isLoading, setIsLoading] = useState(false)
  return (
    <div className="flex items-center justify-end gap-2">
      {/* <Button
        onClick={async () => {
        }}>
        Test
      </Button> */}

      <IntInput
        className="w-24"
        disabled={isStarted}
        placeholder="Port"
        value={serverConfig.data.port}
        onDone={(port) => serverConfig.update({ port })}
      />
      <IntInput
        className="w-24"
        disabled={isStarted}
        placeholder="Concurrency"
        value={serverConfig.data.concurrency}
        onDone={(concurrency) => serverConfig.update({ concurrency })}
      />

      <Switch
        disabled={isStarted}
        className={"data-[state=checked]:border-gold-9"}
        thumbClassName="data-[state=checked]:bg-gold-9"
        title="GPU"
        checked={serverConfig.data.useGpu}
        onCheckedChange={(useGpu) => serverConfig.update({ useGpu })}
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
