import cn from "clsx"
import { NavArrowDown } from "iconoir-react"
import type { ReactNode } from "react"
import { useState } from "react"

export const Accordion = ({
  className = "w-full",
  heading = <span>What is this?</span>,
  children = null as ReactNode,
  defaultOpen = false,
  hideArrow = false,
  endHeading = null as ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className={className}>
      <div className="flex flex-row justify-between p-6">
        <div className="flex items-center w-4/5 overflow-hidden">{heading}</div>
        <div className="flex items-center justify-end w-1/5">
          {endHeading}
          {!hideArrow && (
            <button
              onClick={() => {
                setIsOpen((o) => !o)
              }}
              type="button"
              className="flex flex-shrink-0 items-center p-5 font-medium text-gray-9"
              aria-expanded="false">
              <NavArrowDown
                className={[
                  "transition-transform",
                  isOpen ? "-rotate-180" : "rotate-0"
                ].join(" ")}
              />
            </button>
          )}
        </div>
      </div>
      <div className={cn("w-full", isOpen ? "flex" : "hidden")}>{children}</div>
    </div>
  )
}
