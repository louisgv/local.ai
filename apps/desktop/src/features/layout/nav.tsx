import { Home } from "iconoir-react"

import { NavButton } from "~features/layout/nav-button"
import { NewConvoButton } from "~features/layout/new-convo"
import { Route } from "~providers/global"

export const Nav = () => {
  return (
    <div className="flex flex-col w-full h-full bg-gray-1 py-8 px-4 gap-4 border-b border-b-gray-6">
      <NavButton route={Route.ModelManager}>
        <Home /> Model Manager
      </NavButton>
      <NewConvoButton />
    </div>
  )
}
