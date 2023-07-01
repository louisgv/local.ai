import { forwardRef, useEffect, useState } from "react"

import { Input, type InputProps } from "./input"

export interface IntInputProps extends InputProps {
  value: number
  onDone?: (value: number) => void
}

const intRegex = /^([0-9]{1,})?$/

export const IntInput = forwardRef<HTMLInputElement, IntInputProps>(
  ({ onDone, value, ...props }, ref) => {
    const [localValue, setLocalValue] = useState<string>(value.toFixed(0))

    useEffect(() => {
      setLocalValue(value.toFixed(0))
    }, [value])

    return (
      <Input
        ref={ref}
        value={localValue}
        onChange={(e) => {
          const newValue = e.target.value
          if (intRegex.test(newValue)) {
            setLocalValue(newValue)
          }
        }}
        onBlur={() => {
          onDone?.(parseInt(localValue) || 0)
        }}
        {...props}
      />
    )
  }
)

IntInput.displayName = "IntInput"
