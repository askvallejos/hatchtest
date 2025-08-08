import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-visible rounded-xs bg-primary px-4 h-10 flex items-center text-sm text-white animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin] duration-150 ease-out relative",
        "before:absolute before:w-0 before:h-0 before:border-4 before:border-transparent before:z-10",
        "data-[side=top]:before:border-t-primary data-[side=top]:before:top-full data-[side=top]:before:left-1/2 data-[side=top]:before:-translate-x-1/2",
        "data-[side=bottom]:before:border-b-primary data-[side=bottom]:before:bottom-full data-[side=bottom]:before:left-1/2 data-[side=bottom]:before:-translate-x-1/2",
        "data-[side=left]:before:border-l-primary data-[side=left]:before:left-full data-[side=left]:before:top-1/2 data-[side=left]:before:-translate-y-1/2",
        "data-[side=right]:before:border-r-primary data-[side=right]:before:right-full data-[side=right]:before:top-1/2 data-[side=right]:before:-translate-y-1/2",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
