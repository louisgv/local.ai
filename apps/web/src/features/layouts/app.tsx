import type { ReactNode } from "react"

import { Logo } from "~features/press/logo"

/**
 * - SideBar | {children}
 */
export const AppLayout = ({
  nav = null as ReactNode,
  children = null as ReactNode
}) => {
  return (
    <div className="h-screen w-screen bg-mauve-1 text-mauve-11 flex">
      <div className="flex flex-col gap-y-5 overflow-y-auto px-6 w-full md:w-1/6">
        <div className="flex h-16 shrink-0 items-center">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col">{nav}</nav>
      </div>

      <div className="flex flex-col flex-1 w-full md:w-5/6 bg-mauve-2 p-8">
        {children}
      </div>
    </div>
  )
}
