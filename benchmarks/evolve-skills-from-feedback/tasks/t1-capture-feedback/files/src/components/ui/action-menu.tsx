import type { ComponentProps } from "react"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type ActionMenuSize = "default" | "lg"

function ActionMenu(props: ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu {...props} />
}

function ActionMenuTrigger(props: ComponentProps<typeof Button>) {
  return (
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon-sm" {...props}>
        <MoreHorizontal />
      </Button>
    </DropdownMenuTrigger>
  )
}

function ActionMenuContent({
  size = "default",
  className,
  ...props
}: ComponentProps<typeof DropdownMenuContent> & { size?: ActionMenuSize }) {
  return (
    <DropdownMenuContent
      data-size={size}
      className={cn("group/action-menu", className)}
      {...props}
    />
  )
}

function ActionMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      className={cn(
        "group-data-[size=lg]/action-menu:h-10 group-data-[size=lg]/action-menu:text-base",
        className
      )}
      {...props}
    />
  )
}

export {
  ActionMenu,
  ActionMenuContent,
  ActionMenuItem,
  ActionMenuTrigger,
  type ActionMenuSize,
}
