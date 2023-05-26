import { cn } from "@localai/theme/utils"
import type { ReactNode } from "react"

/**
 * - {nav}      | {children}
 * - {sidebar}  |
 */
export const AppLayout = ({
  nav = null as ReactNode,
  sidebar = null as ReactNode,
  children = null as ReactNode,
  showSidebar = false
}) => {
  return (
    <div className="h-screen w-screen bg-gray-1 text-gray-11 flex">
      <div
        className={cn(
          "transition-all",
          "hidden flex-col sm:flex",
          showSidebar ? "w-full sm:w-72 opacity-100" : "w-0 opacity-0"
        )}>
        <nav className="flex w-full shrink-0 items-center sticky top-0">
          {nav}
        </nav>
        <div className="flex flex-1 flex-col overflow-auto w-full">
          {sidebar}
        </div>
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
