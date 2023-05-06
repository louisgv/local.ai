import type { ReactNode } from "react"

export const WindowButtons = () => (
  <div className="flex gap-2 p-2 pr-3 border-b-2 border-mauve-2 w-min">
    <div className="w-3 h-3 bg-red-10 rounded-md" />
    <div className="w-3 h-3 bg-yellow-10 rounded-md" />
    <div className="w-3 h-3 bg-green-10 rounded-md" />
  </div>
)

export const GenericDemoWindow = ({
  className = "",
  topBar = (
    <div className="flex w-full border-b-2 border-mauve-2 bg-mauve-2" />
  ) as ReactNode,
  children = (
    <div className="flex flex-row truncate h-32 relative" />
  ) as ReactNode
}) => {
  return (
    <div
      className={`rounded-md border-mauve-2 border bg-mauve-2 overflow-hidden ${className}`}>
      <div className="flex truncate">
        <WindowButtons />
        {topBar}
      </div>
      {children}
    </div>
  )
}
