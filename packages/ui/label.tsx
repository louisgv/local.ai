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
        "absolute -top-3 right-2 text-xs px-2 py-px rounded-md transition-opacity z-10 text-ellipsis whitespace-nowrap",
        "transition-all",
        "bg-gray-3",
        "group-hover:bg-gray-4 group-hover:text-gray-12 group-focus:bg-gray-5",
        isHidden ? "opacity-0" : "opacity-100",
        className
      )}
      {...props}
    />
  )
)

CornerLabel.displayName = "CornerLabel"

export { CornerLabel as CornerLabel }
