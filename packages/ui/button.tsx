import { cn } from "@localai/theme/utils"
import { KeyAlt } from "iconoir-react"
import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react"

import { Spinner } from "./spinner"

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export const Button = ({ className, ...props }: ButtonProps) => (
  <button
    {...props}
    className={cn(
      `bg-gray-3 hover:bg-gray-4 py-2 px-4 text-sm flex flex-row items-center gap-2 border rounded-md transition`,
      "disabled:border-gray-9 disabled:text-gray-9",
      "text-gray-11 hover:text-gray-12 border-gray-11 hover:border-gray-12",
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
  Icon?: typeof KeyAlt
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
