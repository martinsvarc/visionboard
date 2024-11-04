import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
}

const TooltipProvider = ({ children }: { children: React.ReactNode }) => children;

const TooltipTrigger = ({ children }: { children: React.ReactNode }) => children;

const TooltipContent = React.forwardRef
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-50 shadow-md",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = "TooltipContent"

const Tooltip = ({ children, content }: TooltipProps) => {
  const [show, setShow] = React.useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
          {content}
        </div>
      )}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
