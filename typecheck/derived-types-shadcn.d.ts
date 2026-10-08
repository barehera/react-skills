// Typecheck-only contracts for shadcn primitives expected in the target app.
// This declaration is validation infrastructure, not a published skill file.

declare module "@/components/ui/badge" {
  import type * as React from "react"

  export function Badge(
    props: React.ComponentProps<"span"> & {
      variant?: "default" | "secondary" | "destructive" | "outline" | null
      asChild?: boolean
    }
  ): React.ReactElement
}

declare module "@/components/ui/item" {
  import type * as React from "react"

  export function Item(
    props: React.ComponentProps<"div"> & {
      variant?: "default" | "outline" | "muted" | null
      size?: "default" | "sm" | null
      asChild?: boolean
    }
  ): React.ReactElement
  export function ItemGroup(
    props: React.ComponentProps<"div">
  ): React.ReactElement
  export function ItemContent(
    props: React.ComponentProps<"div">
  ): React.ReactElement
  export function ItemTitle(
    props: React.ComponentProps<"div">
  ): React.ReactElement
  export function ItemDescription(
    props: React.ComponentProps<"p">
  ): React.ReactElement
  export function ItemActions(
    props: React.ComponentProps<"div">
  ): React.ReactElement
}

declare module "@/components/ui/toggle-group" {
  import type * as React from "react"

  type ToggleGroupVariantProps = {
    variant?: "default" | "outline" | null
    size?: "default" | "sm" | "lg" | null
    disabled?: boolean
  }

  type ToggleGroupSingleProps = {
    type: "single"
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
  }

  type ToggleGroupMultipleProps = {
    type: "multiple"
    value?: string[]
    defaultValue?: string[]
    onValueChange?: (value: string[]) => void
  }

  export function ToggleGroup(
    props: Omit<React.ComponentProps<"div">, "defaultValue"> &
      ToggleGroupVariantProps &
      (ToggleGroupSingleProps | ToggleGroupMultipleProps)
  ): React.ReactElement
  export function ToggleGroupItem(
    props: Omit<React.ComponentProps<"button">, "value"> &
      Pick<ToggleGroupVariantProps, "variant" | "size"> & { value: string }
  ): React.ReactElement
}
