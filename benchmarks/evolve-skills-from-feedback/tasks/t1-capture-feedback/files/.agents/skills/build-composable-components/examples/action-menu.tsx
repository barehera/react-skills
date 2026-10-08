// Composable family (lives in src/components/ui/action-menu.tsx in an app)
// followed by a feature adapter that composes it.
import { createContext, use, type ComponentProps } from "react"
import { useMutation } from "@tanstack/react-query"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------- composable family

type ActionMenuSize = "default" | "lg"

const ActionMenuContext = createContext<{ loading: boolean }>({
  loading: false,
})

function ActionMenu({
  loading = false,
  ...props
}: ComponentProps<typeof DropdownMenu> & { loading?: boolean }) {
  return (
    <ActionMenuContext value={{ loading }}>
      <DropdownMenu {...props} />
    </ActionMenuContext>
  )
}

function ActionMenuTrigger({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        {...props}
      >
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
  disabled,
  className,
  ...props
}: ComponentProps<typeof DropdownMenuItem>) {
  const { loading } = use(ActionMenuContext)

  return (
    <DropdownMenuItem
      className={cn(
        "group-data-[size=lg]/action-menu:h-10 group-data-[size=lg]/action-menu:text-base",
        className
      )}
      {...props}
      disabled={disabled || loading}
    />
  )
}

// ----------------------------------------------------------- feature adapter

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function DocumentActions({ documentId }: { documentId: string }) {
  const duplicate = useMutation({
    mutationFn: () => wait(300).then(() => `${documentId}-copy`),
  })
  const archive = useMutation({ mutationFn: () => wait(300) })

  return (
    <ActionMenu loading={duplicate.isPending || archive.isPending}>
      <ActionMenuTrigger aria-label="Document actions" />
      <ActionMenuContent align="end">
        <ActionMenuItem onSelect={() => duplicate.mutate()}>
          Duplicate
        </ActionMenuItem>
        <ActionMenuItem variant="destructive" onSelect={() => archive.mutate()}>
          Archive
        </ActionMenuItem>
      </ActionMenuContent>
    </ActionMenu>
  )
}
