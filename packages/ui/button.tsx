import { cn } from "@localai/theme/utils"
import type {
  ButtonHTMLAttributes,
  ComponentType,
  DetailedHTMLProps
} from "react"

import { Spinner } from "./spinner"

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export const Button = ({ className, ...props }: ButtonProps) => (
  <button
    {...props}
    className={cn(
      "py-2 px-4 h-10",
      `bg-gray-3 hover:bg-gray-4 text-sm flex flex-row items-center gap-2 rounded-md transition`,
      "disabled:text-gray-9",
      "text-gray-11 hover:text-gray-12",
      className
    )}
  />
)

export const SpinnerButton = ({
  children,
  Icon = null,
  isSpinning = false,
  ...props
}: ButtonProps & {
  Icon?: ComponentType<{ className?: string }>
  isSpinning?: boolean
}) => (
  <Button {...props} disabled={isSpinning || props.disabled}>
    {isSpinning ? (
      <Spinner className={`w-5 h-5`} />
    ) : (
      Icon && <Icon className={`w-5 h-5`} />
    )}
    {children}
  </Button>
)
