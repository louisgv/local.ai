import { Button } from "@localai/ui/button"
import { FilePlusIcon } from "@radix-ui/react-icons"

import { Route, useGlobal } from "~providers/global"

export const NewThreadButton = ({ className = "" }) => {
  const {
    activeThreadState: [_, setActiveThread],
    routeState: [__, setCurrentRoute],
    threadsDirectoryState: { createThread, updateThreadsDirectory }
  } = useGlobal()

  return (
    <Button
      className={className}
      onClick={async () => {
        const newThread = await createThread()
        await updateThreadsDirectory()
        setActiveThread(newThread)
        setCurrentRoute(Route.Chat)
      }}>
      <FilePlusIcon className="w-4 h-4 shrink-0" /> New Thread
    </Button>
  )
}
