import { AppLayout } from "@localai/ui/layouts/app"
import { Home } from "iconoir-react"
import type { ReactNode } from "react"

import { NavButton } from "~features/layout/nav-button"
import { NewThreadButton } from "~features/layout/new-thread"
import { ChatSideBar } from "~features/layout/side-bar"
import { useGlobal } from "~providers/global"
import { Route } from "~providers/global"

const TopBar = () => {
  return (
    <div className="flex justify-center flex-col w-full h-16 px-4 gap-4 border-b border-b-gray-6">
      <NewThreadButton />
    </div>
  )
}

const BottomBar = () => {
  return (
    <div className="flex flex-col w-full h-full py-3 px-2 gap-4 border-t border-t-gray-6">
      <NavButton route={Route.ModelManager}>
        <Home /> Model Manager
      </NavButton>
    </div>
  )
}

export const Layout = ({ children = null as ReactNode }) => {
  const {
    serverStartedState: [isStarted]
  } = useGlobal()

  return (
    <AppLayout
      showSidebar={!isStarted}
      top={<TopBar />}
      sidebar={<ChatSideBar />}
      bottom={<BottomBar />}>
      {children}
    </AppLayout>
  )
}
