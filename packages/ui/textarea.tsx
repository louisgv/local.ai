import { cn } from "@lab/theme/utils"
import { ResetIcon } from "@radix-ui/react-icons"
import { type TextareaHTMLAttributes, forwardRef } from "react"

import { Button } from "./button"
import { CornerLabel } from "./label"

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  onRevert?: () => void
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ onRevert, className, ...props }, ref) => {
    return (
      <div className={cn("relative w-full group", className)}>
        {props.title && <CornerLabel>{props.title}</CornerLabel>}
        <textarea
          className={cn(
            "border border-gray-6 focus:border-gray-7",
            "flex min-h-[80px] w-full rounded-md px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all",
            "outline-1 focus:ring-offset-gray-8 focus-visible:ring-gray-7",
            "focus-visible:ring-1 focus-visible:ring-offset-1",
            "placeholder:text-gray-10",
            "bg-gray-1 focus:bg-gray-2",
            "text-gray-11 focus:text-gray-12",
            className
          )}
          ref={ref}
          {...props}
        />

        {onRevert && (
          <Button
            className="absolute right-2 bottom-2 w-4 h-4 p-0.5"
            onClick={onRevert}>
            <ResetIcon />
          </Button>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
