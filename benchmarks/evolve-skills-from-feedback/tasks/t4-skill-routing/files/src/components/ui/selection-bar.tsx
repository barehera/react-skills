import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function SelectionBar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="toolbar"
      data-slot="selection-bar"
      className={cn(
        "flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2",
        className
      )}
      {...props}
    />
  )
}

function SelectionBarCount({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-live="polite"
      data-slot="selection-bar-count"
      className={cn("flex-1 text-sm", className)}
      {...props}
    />
  )
}

function SelectionBarActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="selection-bar-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

export { SelectionBar, SelectionBarActions, SelectionBarCount }
