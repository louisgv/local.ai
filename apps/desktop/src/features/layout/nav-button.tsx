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
        "w-full transition-all",
        currentRoute === route && (isActive === undefined ? true : isActive)
          ? "bg-gray-5 text-gray-12 border-gray-12 pointer-events-none"
          : "border-gray-1"
      )}
      onClick={async () => {
        await onPressed()
        setCurrentRoute(route)
      }}>
      {children}
    </Button>
  )
}
