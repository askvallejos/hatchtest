import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scrollArea"
import { Separator } from "@/components/ui/separator"

const sidebarVariants = cva(
  "group relative flex h-full w-full flex-col gap-4 border-r bg-background p-4 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "border-border",
        secondary: "border-border/50 bg-muted/50",
      },
      size: {
        default: "w-64",
        sm: "w-48",
        lg: "w-80",
        full: "w-full",
      },
      collapsed: {
        true: "w-18",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      collapsed: false,
    },
  }
)

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, size, collapsed = false, onCollapsedChange, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(sidebarVariants({ variant, size, collapsed }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    collapsed?: boolean
  }
>(({ className, collapsed = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-10 shrink-0 items-center", collapsed ? "justify-center" : "justify-between", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarHeaderTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 font-semibold", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarHeaderTitle.displayName = "SidebarHeaderTitle"

const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    collapsed?: boolean
    onCollapsedChange?: (collapsed: boolean) => void
  }
>(({ className, collapsed = false, onCollapsedChange, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="sm"
    className={cn("h-8 w-8 p-0 hover:bg-transparent", className)}
    onClick={() => onCollapsedChange?.(!collapsed)}
    {...props}
  >
    {collapsed ? (
      <ChevronRight className="h-4 w-4" />
    ) : (
      <ChevronLeft className="h-4 w-4" />
    )}
    <span className="sr-only">Toggle sidebar</span>
  </Button>
))
SidebarToggle.displayName = "SidebarToggle"

const SidebarNav = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
    {children}
  </div>
))
SidebarNav.displayName = "SidebarNav"

const SidebarNavItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props}>
    {children}
  </div>
))
SidebarNavItem.displayName = "SidebarNavItem"

const SidebarNavLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    active?: boolean
    icon?: React.ReactNode
    collapsed?: boolean
  }
>(({ className, active, icon, children, collapsed = false, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:text-gray-900 dark:hover:text-gray-100 h-10",
      active && "bg-accent text-accent-foreground",
      className
    )}
    {...props}
  >
    {icon && <span className="flex h-4 w-4 items-center justify-center">{icon}</span>}
    {!collapsed && <span className="truncate transition-opacity duration-300">{children}</span>}
  </a>
))
SidebarNavLink.displayName = "SidebarNavLink"

const SidebarNavSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
    collapsible?: boolean
    defaultOpen?: boolean
  }
>(({ className, title, collapsible = false, defaultOpen = true, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  if (!collapsible) {
    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
        {title && (
          <div className="flex items-center gap-2 px-3 py-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </h4>
          </div>
        )}
        {children}
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {title}
            <ChevronRight className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-90" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-1">
          {children}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
})
SidebarNavSection.displayName = "SidebarNavSection"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto flex shrink-0 items-center gap-2", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollArea>,
  React.ComponentPropsWithoutRef<typeof ScrollArea>
>(({ className, children, ...props }, ref) => (
  <ScrollArea ref={ref} className={cn("flex-1", className)} {...props}>
    {children}
  </ScrollArea>
))
SidebarScrollArea.displayName = "SidebarScrollArea"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator ref={ref} className={cn("my-2", className)} {...props} />
))
SidebarSeparator.displayName = "SidebarSeparator"

export {
  Sidebar,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarToggle,
  SidebarNav,
  SidebarNavItem,
  SidebarNavLink,
  SidebarNavSection,
  SidebarFooter,
  SidebarScrollArea,
  SidebarSeparator,
} 