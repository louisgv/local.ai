import { Button } from "@lab/ui/button"
import { FilePlusIcon } from "@radix-ui/react-icons"

import { InvokeCommand, invoke } from "~features/invoke"
import { Route, useGlobal } from "~providers/global"

export const NewThreadButton = ({ className = "" }) => {
  const {
    activeThreadState: [_, setActiveThread],
    routeState: [__, setCurrentRoute],
    threadsDirectoryState: { updateThreadsDirectory }
  } = useGlobal()

  return (
    <Button
      className={className}
      onClick={async () => {
        const newThread = await invoke(InvokeCommand.CreateThreadFile)
        await updateThreadsDirectory()
        setActiveThread(newThread)
        setCurrentRoute(Route.Thread)
      }}>
      <FilePlusIcon className="w-4 h-4 shrink-0" /> New Thread
    </Button>
  )
}
