import { cn } from "@localai/theme/utils"
import { Cross1Icon, ResetIcon } from "@radix-ui/react-icons"
import {
  type InputHTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useState
} from "react"

import { Button } from "./button"

export interface StopSequenceInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  value: string[]
  onRevert?: () => void
  onDone?: (value: string[]) => void
}

export const TokenInput = forwardRef<HTMLInputElement, StopSequenceInputProps>(
  (
    { onDone, onRevert, value, className, title, placeholder, ...props },
    ref
  ) => {
    const [inputToken, setInputToken] = useState("")
    const [localValue, setLocalValue] = useState<string[]>(value)

    useEffect(() => {
      setLocalValue(value)
    }, [value])

    const addToken = useCallback(() => {
      if (inputToken === "" || localValue.includes(inputToken)) {
        return
      }
      const newList = [...localValue, inputToken]
      setLocalValue(newList)
      onDone?.(newList)
      setInputToken("")
    }, [inputToken, localValue, onDone])

    return (
      <div className={cn("relative flex rounded-md w-full", className)}>
        {(title || placeholder) && (
          <label
            className={cn(
              "absolute -top-2 right-2 text-xs bg-gray-3 px-2 py-px rounded-md transition-opacity z-10 text-ellipsis whitespace-nowrap",
              title ||
                props.defaultValue !== undefined ||
                (value && value.length > 0)
                ? "opacity-100"
                : "opacity-0"
            )}>
            {title || placeholder}
          </label>
        )}
        <div
          className={cn(
            "h-full w-full",
            "py-2 px-3 rounded-md",
            "border border-gray-6 focus:border-gray-7",
            "bg-transparent text-sm",
            "transition-all",
            "focus-visible:ring-1 focus-visible:ring-offset-2",
            "text-gray-11 focus:text-gray-12",
            "flex flex-wrap gap-1",
            "focus-within:ring-1 focus-within:ring-offset-2 focus-within:ring-offset-gray-7 focus-within:ring-gray-8",
            className
          )}>
          {localValue.map((v, i) => (
            <span
              key={i}
              className="flex bg-gray-3 my-1 rounded-md overflow-hidden">
              <pre className="bg-gray-1 shadow-inner px-1">{v}</pre>
              <Button
                className="w-5 h-5 p-1 rounded-l-none"
                onClick={() => {
                  const newList = localValue.filter((_, j) => j !== i)
                  setLocalValue(newList)
                  onDone?.(newList)
                }}>
                <Cross1Icon />
              </Button>
            </span>
          ))}
          <input
            className={cn(
              "bg-transparent text-sm focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors",
              "placeholder:text-gray-10",
              "text-gray-11 focus:text-gray-12"
            )}
            ref={ref}
            value={inputToken}
            onChange={(e) => {
              const newValue = e.target.value
              setInputToken(newValue)
            }}
            onBlur={() => {
              addToken()
            }}
            placeholder={localValue.length === 0 ? placeholder : "Add new"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addToken()
              }
            }}
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
      </div>
    )
  }
)
