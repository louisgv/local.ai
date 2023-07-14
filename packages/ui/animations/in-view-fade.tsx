import { cn } from "@lab/theme/utils"
import type { ReactNode } from "react"
import { useInView } from "react-intersection-observer"

export const InViewFadeUp = ({
  id = "",
  children = null as ReactNode,
  className = ""
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true
  })

  return (
    <div
      id={id}
      ref={ref}
      className={cn(
        "transition-all duration-700 will-change-transform",
        inView
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-64",
        className
      )}>
      {children}
    </div>
  )
}
