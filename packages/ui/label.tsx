import { cn } from "@lab/theme/utils"
import { type LabelHTMLAttributes, forwardRef } from "react"

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  isHidden?: boolean
}

const CornerLabel = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, isHidden, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "absolute -top-3 right-2 text-xs bg-gray-3 px-2 py-px rounded-md transition-opacity z-10 text-ellipsis whitespace-nowrap",
        isHidden ? "opacity-0" : "opacity-100",
        className
      )}
      {...props}
    />
  )
)

CornerLabel.displayName = "CornerLabel"

export { CornerLabel as CornerLabel }
