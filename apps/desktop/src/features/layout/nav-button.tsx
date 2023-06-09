import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import type { ReactNode } from "react"

import { type Route, useGlobal } from "~providers/global"

export const NavButton = ({
  isActive = undefined as boolean,
  route = undefined as Route,
  children = null as ReactNode,
  onPressed = async () => {}
}) => {
  const {
    routeState: [currentRoute, setCurrentRoute]
  } = useGlobal()

  return (
    <Button
      className={cn(
        "group",
        "w-full transition-all",
        currentRoute === route && (isActive === undefined ? true : isActive)
          ? "bg-gray-5 text-gray-12 ring-offset-1 ring-offset-gray-11 ring-gray-9 ring-2"
          : "ring-offset-0 ring-offset-transparent ring-transparent"
      )}
      onClick={async () => {
        await onPressed()
        setCurrentRoute(route)
      }}>
      {children}
    </Button>
  )
}
