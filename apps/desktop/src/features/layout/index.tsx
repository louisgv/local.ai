import { Button } from "@localai/ui/button"
import { AppLayout } from "@localai/ui/layouts/app"
import { Home } from "iconoir-react"
import type { ReactNode } from "react"

import { Nav } from "~features/layout/nav"
import { NewConvoButton } from "~features/layout/new-convo"
import { ChatSideBar } from "~features/layout/side-bar"
import { useGlobal } from "~providers/global"

export const Layout = ({ children = null as ReactNode }) => {
  const {
    activeModelState: [activeModel]
  } = useGlobal()

  return (
    <AppLayout
      showSidebar={!!activeModel}
      nav={<Nav />}
      sidebar={<ChatSideBar />}>
      {children}
    </AppLayout>
  )
}
