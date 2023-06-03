import { cn } from "@localai/theme/utils"
import { type InputHTMLAttributes, forwardRef } from "react"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, children, ...props }, ref) => {
    return (
      <div className={cn("relative flex h-10 rounded-md", className)}>
        <label
          className={cn(
            "absolute -top-2 right-2 text-xs bg-gray-3 px-2 py-px rounded-md transition-opacity z-50 text-ellipsis whitespace-nowrap",
            props.value || props.defaultValue ? "opacity-100" : "opacity-0"
          )}>
          {props.placeholder}
        </label>

        <input
          type={type}
          className={cn(
            "h-full w-full",
            "px-3 py-2",
            "border border-gray-6 rounded-md",
            "transition-colors",
            "bg-transparent text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "placeholder:text-gray-10",
            "outline-1",
            "text-gray-11",
            className
          )}
          ref={ref}
          {...props}
        />
        {children}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
