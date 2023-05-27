import { cn } from "@localai/theme/utils"
import type { ReactNode } from "react"

/**
 * {top}      | {children}
 * {sidebar}  |
 * {bottom}   |
 */
export const AppLayout = ({
  top = null as ReactNode,
  sidebar = null as ReactNode,
  bottom = null as ReactNode,
  children = null as ReactNode,
  showSidebar = false
}) => {
  return (
    <div className="h-screen w-screen bg-gray-1 text-gray-11 flex">
      <div
        className={cn(
          "transition-all border-r border-r-gray-6",
          "hidden sm:flex flex-col",
          showSidebar ? "w-full sm:w-72 opacity-100" : "w-0 opacity-0"
        )}>
        <div className="flex w-full items-center">{top}</div>
        <div className="flex flex-1 shrink-0 flex-col overflow-auto w-full h-full">
          {sidebar}
        </div>
        <div className="flex flex-col overflow-auto w-full">{bottom}</div>
      </div>

      <div
        className={cn(
          showSidebar ? "w-full md:w-5/6" : "w-full",
          "flex flex-col flex-1",
          "overflow-auto h-screen"
        )}>
        {children}
      </div>
    </div>
  )
}
