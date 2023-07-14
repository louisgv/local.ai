import { Button } from "@lab/ui/button"
import { AppLayout } from "@lab/ui/layouts/app"
import { useUI } from "@lab/ui/provider"
import { Switch } from "@lab/ui/switch"
import {
  DotsHorizontalIcon,
  MoonIcon,
  OpenInNewWindowIcon,
  SunIcon
} from "@radix-ui/react-icons"
import { open as dialogOpen } from "@tauri-apps/api/dialog"
import { Home } from "iconoir-react"
import type { ReactNode } from "react"

import { InvokeCommand, invoke } from "~features/invoke"
import { NavButton } from "~features/layout/nav-button"
import { ViewHeader } from "~features/layout/view"
import { NewThreadButton } from "~features/thread/new-thread"
import { ChatSideBar } from "~features/thread/side-bar"
import { Route, useGlobal } from "~providers/global"

const TopBar = () => {
  const {
    threadsDirectoryState: { threadsDirectory, updateThreadsDirectory }
  } = useGlobal()
  return (
    <ViewHeader className="flex justify-center items-center p-4 border-b border-b-gray-6 gap-0">
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
    </ViewHeader>
  )
}

const BottomBar = () => {
  const {
    darkModeState: [isDarkMode, setIsDarkMode]
  } = useUI()
  return (
    <div className="flex flex-row w-full h-full py-3 px-2 gap-2 border-t border-t-gray-6">
      <NavButton route={Route.ModelManager}>
        <Home /> Model Manager
      </NavButton>

      <Switch
        checked={isDarkMode}
        onCheckedChange={setIsDarkMode}
        on={<MoonIcon />}
        off={<SunIcon />}
      />
      <NavButton route={Route.ServerManager}>
          <Home /> Server Manager
        </NavButton>

    </div>
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
      className="animate-fade-in-once-delayed opacity-0"
      showSidebar={isSidebarShowing && (isStarted || !!onboardStage)}
      top={<TopBar />}
      sidebar={<ChatSideBar />}
      bottom={<BottomBar />}>
      {children}
    </AppLayout>
  )
}
