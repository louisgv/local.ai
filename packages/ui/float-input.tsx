import { forwardRef, useEffect, useState } from "react"

import { Input, type InputProps } from "./input"

export interface FloatInputProps extends InputProps {
  value: number
  onDone?: (value: number) => void
  floatingPoint?: number
}

const floatRegex = /^([0-9]{1,})?(\.)?([0-9]{1,})?$/

export const FloatInput = forwardRef<HTMLInputElement, FloatInputProps>(
  ({ onDone, floatingPoint = 3, value, ...props }, ref) => {
    const [localValue, setLocalValue] = useState<string>(
      value.toFixed(floatingPoint)
    )

    useEffect(() => {
      setLocalValue(value.toFixed(floatingPoint))
    }, [value, floatingPoint])

    return (
      <Input
        ref={ref}
        value={localValue}
        onChange={(e) => {
          const newValue = e.target.value
          if (floatRegex.test(newValue)) {
            setLocalValue(newValue)
          }
        }}
        onBlur={() => {
          onDone?.(parseFloat(localValue) || 0)
        }}
        {...props}
      />
    )
  }
)

FloatInput.displayName = "FloatInput"
