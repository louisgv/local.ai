import { Button } from "@localai/ui/button"
import { Home } from "iconoir-react"

import { NewConvoButton } from "~features/layout/new-convo"

export const Nav = () => {
  return (
    <div className="flex flex-col w-full h-full bg-gray-1 py-8 px-4 gap-4 border-b border-b-gray-6">
      <Button>
        <Home /> Model Manager
      </Button>
      <NewConvoButton />
    </div>
  )
}
