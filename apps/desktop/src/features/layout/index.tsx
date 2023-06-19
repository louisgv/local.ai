import { Button } from "@localai/ui/button"
import { AppLayout } from "@localai/ui/layouts/app"
import { DotsHorizontalIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons"
import { open as dialogOpen } from "@tauri-apps/api/dialog"
import { Home } from "iconoir-react"
import type { ReactNode } from "react"

import { InvokeCommand, invoke } from "~features/invoke"
import { NavButton } from "~features/layout/nav-button"
import { NewThreadButton } from "~features/thread/new-thread"
import { ChatSideBar } from "~features/thread/side-bar"
import { Route, useGlobal } from "~providers/global"

const TopBar = () => {
  const {
    threadsDirectoryState: { threadsDirectory, updateThreadsDirectory }
  } = useGlobal()
  return (
    <div className="flex justify-center items-center w-full h-16 p-4 border-b border-b-gray-6">
      <NewThreadButton className="w-full rounded-r-none" />
      <Button
        title="Change threads directory"
        className="rounded-none"
        onClick={async () => {
          const selected = (await dialogOpen({
            directory: true,
            multiple: false
          })) as string

          if (!selected) {
            return
          }
          await updateThreadsDirectory(selected)
        }}>
        <DotsHorizontalIcon />
      </Button>
      <Button
        title="Open threads directory"
        className="rounded-l-none"
        onClick={() => {
          invoke(InvokeCommand.OpenDirectory, {
            path: threadsDirectory
          })
        }}>
        <OpenInNewWindowIcon />
      </Button>
    </div>
  )
}

const BottomBar = () => {
  return (
    <>
      <div className="flex flex-col w-full h-full py-3 px-2 gap-4 border-t border-t-gray-6">
        <NavButton route={Route.ModelManager}>
          <Home /> Model Manager
        </NavButton>
      </div>
      <div className="flex flex-col w-full h-full py-3 px-2 gap-4 border-t border-t-gray-6">
        <NavButton route={Route.ServerManager}>
          <Home /> Server Manager
        </NavButton>
      </div>
    </>
  )
}

export const Layout = ({ children = null as ReactNode }) => {
  const {
    serverStartedState: [isStarted],
    sidebarState: [isSidebarShowing],
    onboardState: [onboardStage]
  } = useGlobal()

  return (
    <AppLayout
      showSidebar={isSidebarShowing && (isStarted || !!onboardStage)}
      top={<TopBar />}
      sidebar={<ChatSideBar />}
      bottom={<BottomBar />}>
      {children}
    </AppLayout>
  )
}
