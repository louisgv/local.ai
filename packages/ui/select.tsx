"use client"

import { cn } from "@localai/theme/utils"
import {
  CheckIcon as Check,
  ChevronDownIcon as ChevronDown,
  ChevronDownIcon,
  ChevronUpIcon
} from "@radix-ui/react-icons"
import * as SelectPrimitive from "@radix-ui/react-select"
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef
} from "react"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm ring-offset-background  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      "border border-gray-6",
      "placeholder:text-gray-11",
      className
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "bg-gray-3",
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md shadow-md animate-in fade-in-80",
        position === "popper" && "translate-y-1",
        className
      )}
      position={position}
      {...props}>
      <SelectPrimitive.Viewport
        className={cn(
          "p-1 flex flex-col gap-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollUpButton
        className={cn(
          "absolute top-0 w-full h-10 py-2 text-gray-11 items-center flex justify-center",
          "bg-gradient-to-b from-gray-3 to-transparent"
        )}>
        <ChevronUpIcon className="h-4 w-4" />
      </SelectPrimitive.ScrollUpButton>

      <SelectPrimitive.ScrollDownButton
        className={cn(
          "absolute bottom-0 w-full h-10 py-2 text-gray-11 items-center flex justify-center",
          "bg-gradient-to-t from-gray-3 to-transparent"
        )}>
        <ChevronDownIcon className="h-4 w-4" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "transition-colors",
      "relative flex w-full cursor-default select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "hover:cursor-pointer",
      "hover:bg-gray-4 text-gray-11",
      "focus:bg-gray-4 focus:text-gray-12",
      "max-w-[calc(var(--radix-select-trigger-width)+24px)]",
      className
    )}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    {children}
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator
}
