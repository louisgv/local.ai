import { cn } from "@lab/theme/utils"
import { SpinnerButton } from "@lab/ui/button"
import { IntInput } from "@lab/ui/int-input"
import { Switch } from "@lab/ui/switch"
import { useState } from "react"

import { InitState, useInit } from "~features/inference-server/use-init"
import { InvokeCommand, invoke } from "~features/invoke"
import { useGlobal } from "~providers/global"

export const ServerConfig = () => {
  const {
    serverConfig,
    serverStartedState: [isStarted],
    startServer,
    stopServer
  } = useGlobal()

  const [isLoading, setIsLoading] = useState(false)

  const [hasGpu, setHasGpu] = useState(false)
  const gpuCheck = useInit(async () => {
    const _hasGpu = await invoke(InvokeCommand.CheckGpu)
    if (!_hasGpu) {
      serverConfig.update({ useGpu: false })
    }
    setHasGpu(_hasGpu)
  })

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
        disabled={
          isStarted || gpuCheck.initState !== InitState.Initialized || !hasGpu
        }
        className={"data-[state=checked]:border-gold-9"}
        thumbClassName="data-[state=checked]:bg-gold-9"
        title="GPU"
        checked={serverConfig.data.useGpu}
        onCheckedChange={(useGpu) => serverConfig.update({ useGpu })}
      />

      <SpinnerButton
        isSpinning={isLoading}
        className={cn(
          "w-32 justify-center",
          "text-white/80 hover:text-white",
          isStarted
            ? "bg-red-9 hover:bg-red-10"
            : "bg-green-9 hover:bg-green-10"
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
