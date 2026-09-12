// Typecheck-only contracts for shadcn primitives expected in the target app.
// This declaration is validation infrastructure, not a published skill file.

declare module "@/lib/utils" {
  export function cn(
    ...inputs: Array<string | number | null | undefined | false>
  ): string
}

declare module "@/components/ui/checkbox" {
  import type * as React from "react"

  export type CheckedState = boolean | "indeterminate"

  export function Checkbox(
    props: Omit<React.ComponentPropsWithRef<"button">, "onChange"> & {
      checked?: CheckedState
      defaultChecked?: CheckedState
      onCheckedChange?: (checked: CheckedState) => void
      required?: boolean
    }
  ): React.ReactElement
}

declare module "@/components/ui/label" {
  import type * as React from "react"

  export function Label(
    props: React.ComponentPropsWithRef<"label">
  ): React.ReactElement
}

declare module "@/components/ui/alert" {
  import type * as React from "react"

  export function Alert(
    props: React.ComponentProps<"div"> & {
      variant?: "default" | "destructive"
    }
  ): React.ReactElement
  export function AlertTitle(
    props: React.ComponentProps<"div">
  ): React.ReactElement
  export function AlertDescription(
    props: React.ComponentProps<"div">
  ): React.ReactElement
}

declare module "@/components/ui/empty" {
  import type * as React from "react"

  export function Empty(props: React.ComponentProps<"div">): React.ReactElement
  export function EmptyTitle(
    props: React.ComponentProps<"div">
  ): React.ReactElement
  export function EmptyDescription(
    props: React.ComponentProps<"div">
  ): React.ReactElement
}
