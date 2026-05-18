import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const CollapsibleContext = React.createContext<{
  isCollapsed: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  openFlyout: () => void
  closeFlyout: () => void
  tooltipText?: string
} | null>(null)

function findTooltip(children: React.ReactNode): string | undefined {
  try {
    let found: string | undefined = undefined
    
    const traverse = (node: React.ReactNode) => {
      if (found) return
      React.Children.forEach(node, (child) => {
        if (found) return
        if (React.isValidElement(child)) {
          const element = child as React.ReactElement<any>
          if (element.props && element.props.tooltip) {
            if (typeof element.props.tooltip === 'string') {
              found = element.props.tooltip
            } else if (element.props.tooltip.children) {
              found = element.props.tooltip.children
            }
          }
          if (!found && element.props.children) {
            traverse(element.props.children)
          }
        }
      })
    }

    traverse(children)
    return found
  } catch (e) {
    return undefined
  }
}

function findMenuText(children: React.ReactNode): string | undefined {
  try {
    let found: string | undefined = undefined

    const traverse = (node: React.ReactNode) => {
      if (found) return
      React.Children.forEach(node, (child) => {
        if (found) return
        if (typeof child === 'string') {
          found = child
          return
        }
        if (React.isValidElement(child)) {
          const element = child as React.ReactElement<any>
          if (element.props && element.props.children) {
            traverse(element.props.children)
          }
        }
      })
    }

    traverse(children)
    return found
  } catch (e) {
    return undefined
  }
}

function Collapsible({
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  
  const [isOpen, setIsOpen] = React.useState(false)
  const timeoutRef = React.useRef<number | null>(null)

  const openFlyout = React.useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }, [])

  const closeFlyout = React.useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(false)
    }, 120)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!isCollapsed) {
    return (
      <CollapsiblePrimitive.Root data-slot="collapsible" {...props}>
        {children}
      </CollapsiblePrimitive.Root>
    )
  }

  const tooltipText = findTooltip(children) || findMenuText(children) || ""

  const contextValue = {
    isCollapsed,
    isOpen,
    setIsOpen,
    openFlyout,
    closeFlyout,
    tooltipText,
  }

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <div
          data-slot="collapsible"
          onMouseEnter={openFlyout}
          onMouseLeave={closeFlyout}
          className="w-full relative"
        >
          {children}
        </div>
      </PopoverPrimitive.Root>
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  const context = React.useContext(CollapsibleContext)
  
  if (!context || !context.isCollapsed) {
    return (
      <CollapsiblePrimitive.CollapsibleTrigger
        data-slot="collapsible-trigger"
        {...props}
      >
        {children}
      </CollapsiblePrimitive.CollapsibleTrigger>
    )
  }

  // Handle direct children safely
  const childArray = React.Children.toArray(children)
  const child = React.isValidElement(childArray[0])
    ? (childArray[0] as React.ReactElement<any>)
    : null

  if (!child) return null

  // Clone child, merge click/hover and disable default tooltip by passing { hidden: true }
  const triggeredElement = React.cloneElement(child, {
    ...props,
    asChild: undefined, // remove asChild to avoid Radix Slot conflicts
    tooltip: { hidden: true },
    className: cn("cursor-pointer w-full", child.props.className, props.className),
    onClick: (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      context.setIsOpen(!context.isOpen)
      if (child.props.onClick) {
        child.props.onClick(e)
      }
    }
  })

  return (
    <PopoverPrimitive.Anchor asChild>
      {triggeredElement}
    </PopoverPrimitive.Anchor>
  )
}

function CollapsibleContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  const context = React.useContext(CollapsibleContext)
  
  if (!context || !context.isCollapsed) {
    return (
      <CollapsiblePrimitive.CollapsibleContent
        data-slot="collapsible-content"
        {...props}
      >
        {children}
      </CollapsiblePrimitive.CollapsibleContent>
    )
  }

  if (!context.isOpen) return null

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        side="right"
        align="start"
        sideOffset={12}
        className={cn(
          "z-50 w-64 rounded-xl border border-neutral-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md outline-none",
          "dark:border-neutral-800/80 dark:bg-neutral-900/95",
          "[&_[data-sidebar=menu-sub]]:border-l-0 [&_[data-sidebar=menu-sub]]:mx-0 [&_[data-sidebar=menu-sub]]:px-0 [&_[data-sidebar=menu-sub]]:gap-0.5",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        onMouseEnter={context.openFlyout}
        onMouseLeave={context.closeFlyout}
        onClick={() => {
          context.setIsOpen(false)
        }}
        {...props}
      >
        {context.tooltipText && (
          <div className="mb-2 px-2.5 py-1 border-b border-neutral-100 dark:border-neutral-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {context.tooltipText}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-1">
          {children}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
