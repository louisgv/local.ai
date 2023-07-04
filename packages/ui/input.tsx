import { cn } from "@lab/theme/utils"
import { ResetIcon } from "@radix-ui/react-icons"
import { type InputHTMLAttributes, forwardRef } from "react"

import { Button } from "./button"
import { CornerLabel } from "./label"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  onRevert?: () => void
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ onRevert, className, type, children, ...props }, ref) => {
    return (
      <div
        className={cn("relative flex h-10 rounded-md w-full group", className)}>
        {(props.title || props.placeholder) && (
          <CornerLabel
            className={
              props.title ||
              props.defaultValue !== undefined ||
              props.value ||
              (typeof props.value === "number" &&
                (props.value === 0 || isNaN(props.value)))
                ? "opacity-100"
                : "opacity-0"
            }>
            {props.title || props.placeholder}
          </CornerLabel>
        )}

        <input
          ref={ref}
          type={type}
          className={cn(
            "h-full w-full",
            "px-3 py-2 rounded-md",
            "border border-gray-6 focus:border-gray-7 active:border-gray-8",
            "bg-gray-1 focus:bg-gray-2",
            "text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all",
            "outline-1 focus:ring-offset-gray-8 focus-visible:ring-gray-7",
            "focus-visible:ring-1 focus-visible:ring-offset-1",
            "placeholder:text-gray-10",
            "text-gray-11 focus:text-gray-12",
            className
          )}
          {...props}
        />
        {onRevert && (
          <Button
            className="absolute right-2 bottom-2 w-4 h-4 p-0.5"
            onClick={onRevert}>
            <ResetIcon />
          </Button>
        )}
        {children}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
