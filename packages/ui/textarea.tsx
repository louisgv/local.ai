import { cn } from "@localai/theme/utils"
import * as React from "react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        {props.title && (
          <label
            className={cn(
              "absolute -top-2 right-2 text-xs bg-gray-3 px-2 py-px rounded-md transition-opacity z-50 text-ellipsis whitespace-nowrap"
            )}>
            {props.title}
          </label>
        )}
        <textarea
          className={cn(
            "border border-gray-6 focus:border-gray-7",
            "flex min-h-[80px] w-full rounded-md bg-transparent px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all",
            "outline-1 focus:ring-offset-gray-7 focus-visible:ring-gray-8",
            "focus-visible:ring-1 focus-visible:ring-offset-2",
            "placeholder:text-gray-10",
            "text-gray-11 focus:text-gray-12",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
