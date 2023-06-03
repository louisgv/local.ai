import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { SidebarCollapse, SidebarExpand } from "iconoir-react"
import type { ReactNode } from "react"

import { useGlobal } from "~providers/global"

export const ViewContainer = ({
  children = null as ReactNode,
  className = ""
}) => (
  <div className={cn("h-full w-full flex flex-col bg-gray-2", className)}>
    {children}
  </div>
)

export const ViewHeader = ({ children = null as ReactNode }) => {
  const {
    serverStartedState: [isStarted],
    sidebarState: [isSidebarShowing, toggleSidebar]
  } = useGlobal()
  return (
    <div className="flex items-center gap-2 bg-gray-1 w-full h-16 shrink-0 px-4 border-b border-b-gray-6 z-50">
      {isStarted && (
        <Button onClick={() => toggleSidebar()}>
          {isSidebarShowing ? <SidebarCollapse /> : <SidebarExpand />}
        </Button>
      )}
      {children}
    </div>
  )
}

export const ViewBody = ({ children = null as ReactNode, className = "" }) => (
  <div className="h-full w-full relative overflow-hidden">
    <div className={cn("h-full w-full overflow-auto", className)}>
      {children}
    </div>
    <div
      className={cn(
        "absolute top-0 w-full h-6",
        "bg-gradient-to-b from-gray-2 to-transparent"
      )}
    />
    <div
      className={cn(
        "absolute bottom-0 w-full h-6",
        "bg-gradient-to-t from-gray-2 to-transparent"
      )}
    />
  </div>
)
