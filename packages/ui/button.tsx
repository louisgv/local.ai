import cn from "clsx"
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
      "gap-2 border-purple-4 border rounded-md py-2 px-4 bg-purple-2 text-mauve-12 gap-x-2 transition-all hover:bg-purple-3 text-base flex items-center",
      className
    )}
  />
)

export const SpinnerButton = ({
  children,
  Icon = null,
  isSpinning = false,
  spinnerClassName = "stroke-yellow-9",
  className = "text-yellow-9 border-yellow-9",
  ...props
}: ButtonProps & {
  Icon?: typeof KeyAlt
  isSpinning?: boolean
  spinnerClassName?: string
}) => (
  <button
    {...props}
    disabled={isSpinning || props.disabled}
    className={cn(
      `bg-purple-2 hover:bg-purple-4 py-2 px-4 text-sm flex flex-row items-center gap-2 border rounded-md transition`,
      "disabled:stroke-gray-9 disabled:border-gray-9 disabled:text-gray-9",
      className
    )}>
    {isSpinning ? (
      <Spinner className={`w-5 h-5 ${spinnerClassName}`} />
    ) : (
      Icon && <Icon width="1em" />
    )}
    {children}
  </button>
)
