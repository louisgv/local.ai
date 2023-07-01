import { cn } from "@lab/theme/utils"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef
} from "react"

import { CornerLabel } from "./label"

const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitives.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    thumbClassName?: string
  }
>(({ className, thumbClassName, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "h-10 w-16 rounded-md",
      "peer relative inline-flex shrink-0 cursor-pointer items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      "text-xs border border-transparent",
      "focus-visible:ring-1 focus-visible:ring-offset-1",
      "data-[state=unchecked]:bg-gray-3",
      "data-[state=unchecked]:hover:bg-gray-4",
      "data-[state=checked]:bg-gray-5",
      "data-[state=checked]:hover:bg-gray-6",
      className
    )}
    {...props}
    ref={ref}>
    {props.title && <CornerLabel>{props.title}</CornerLabel>}
    <SwitchPrimitives.Thumb
      className={cn(
        "h-5 w-5 flex justify-center items-center p-2 rounded-md bg-gray-9",
        "pointer-events-none ring-0 transition-transform",
        "shadow-inner shadow-gray-3",
        "data-[state=unchecked]:translate-x-2",
        "data-[state=checked]:translate-x-8",
        thumbClassName
      )}
    />
    {props.checked ? (
      <pre className="absolute left-3 top-3 text-white data-[state=unchecked]:translate-x-2">
        ON
      </pre>
    ) : (
      <pre className="absolute right-2 top-3 text-white">OFF</pre>
    )}
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
