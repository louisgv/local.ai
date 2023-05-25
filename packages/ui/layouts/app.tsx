import { cn } from "@localai/theme/utils"
import type { ReactNode } from "react"

/**
 * - SideBar | {children}
 */
export const AppLayout = ({
  nav = null as ReactNode,
  children = null as ReactNode,
  logo = null as ReactNode
}) => {
  return (
    <div className="h-screen w-screen bg-mauve-1 text-mauve-11 flex">
      <div
        className={cn(
          "gap-y-5 overflow-y-auto px-6 ",
          "hidden flex-col w-full sm:flex sm:w-72"
        )}>
        <div className="flex h-16 shrink-0 items-center">{logo}</div>
        <nav className="flex flex-1 flex-col">{nav}</nav>
      </div>

      <div
        className={cn(
          "flex flex-col flex-1 w-full md:w-5/6 bg-mauve-2 p-8",
          "overflow-auto h-screen"
        )}>
        {children}
      </div>
    </div>
  )
}
