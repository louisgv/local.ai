import { cn } from "@lab/theme/utils"
import {
  type ButtonHTMLAttributes,
  type ComponentType,
  forwardRef
} from "react"

import { Spinner } from "./spinner"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      {...props}
      ref={ref}
      className={cn(
        "py-2 px-4 h-10",
        `bg-gray-3 hover:bg-gray-4 text-sm flex flex-row items-center gap-2 rounded-md transition`,
        "disabled:text-gray-9 disabled:bg-gray-1",
        "text-gray-11 hover:text-gray-12",
        className
      )}
    />
  )
)

Button.displayName = "Button"

const SpinnerButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    Icon?: ComponentType<{ className?: string }>
    isSpinning?: boolean
  }
>(({ children, Icon = null, isSpinning = false, ...props }, ref) => (
  <Button {...props} ref={ref} disabled={isSpinning || props.disabled}>
    {isSpinning ? (
      <Spinner className={`w-5 h-5`} />
    ) : (
      Icon && <Icon className={`w-5 h-5`} />
    )}
    {children}
  </Button>
))

SpinnerButton.displayName = "SpinnerButton"

export { Button, SpinnerButton }
