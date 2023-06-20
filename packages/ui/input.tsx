import { cn } from "@localai/theme/utils"
import { ResetIcon } from "@radix-ui/react-icons"
import { type InputHTMLAttributes, forwardRef } from "react"

import { Button } from "./button"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  onRevert?: () => void
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ onRevert, className, type, children, ...props }, ref) => {
    return (
      <div className={cn("relative flex h-10 rounded-md w-full", className)}>
        {(props.title || props.placeholder) && (
          <label
            className={cn(
              "absolute -top-2 right-2 text-xs bg-gray-3 px-2 py-px rounded-md transition-opacity z-10 text-ellipsis whitespace-nowrap",
              props.title ||
                props.defaultValue !== undefined ||
                props.value ||
                (typeof props.value === "number" &&
                  (props.value === 0 || isNaN(props.value)))
                ? "opacity-100"
                : "opacity-0"
            )}>
            {props.title || props.placeholder}
          </label>
        )}

        <input
          type={type}
          className={cn(
            "h-full w-full",
            "px-3 py-2 rounded-md",
            "border border-gray-6 focus:border-gray-7",
            "bg-transparent text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
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
