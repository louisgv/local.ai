import { cn } from "@lab/theme/utils"
import { type HTMLAttributes, type ReactNode, forwardRef } from "react"

export interface ViewProps extends HTMLAttributes<HTMLDivElement> {
  onRevert?: () => void
}

export const ViewContainer = ({
  children = null as ReactNode,
  className = ""
}) => (
  <div className={cn("h-full w-full flex flex-col bg-gray-2", className)}>
    {children}
  </div>
)

export const ViewHeader = ({
  children = null as ReactNode,
  className = ""
}) => {
  return (
    <div
      // data-tauri-drag-region
      className={cn(
        "flex items-center gap-2 bg-gray-1 w-full h-20 shrink-0 px-4 border-b border-b-gray-6 z-30",
        className
      )}>
      {children}
      {/* // For future maybe custom window bar
      <div className="flex ml-auto">
        <Button
          className="rounded-r-none"
          onClick={() => getWindow().minimize()}>
          <MinusIcon />
        </Button>

        <Button
          className="rounded-none"
          onClick={() => getWindow().toggleMaximize()}>
          <StopIcon />
        </Button>

        <Button className="rounded-l-none" onClick={() => getWindow().close()}>
          <Cross1Icon />
        </Button>
      </div> */}
    </div>
  )
}

export const ViewBody = forwardRef<HTMLDivElement, ViewProps>(
  ({ children = null as ReactNode, className = "", ...props }, ref) => (
    <div className="h-full w-full relative overflow-hidden">
      <div
        className={cn("h-full w-full overflow-auto", className)}
        {...props}
        ref={ref}>
        {children}
      </div>
      <div
        className={cn(
          "absolute top-0 w-full h-6",
          "bg-gradient-to-b from-gray-2 to-transparent"
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 w-full h-6",
          "bg-gradient-to-t from-gray-2 to-transparent"
        )}
      />
    </div>
  )
)

ViewBody.displayName = "ViewBody"
