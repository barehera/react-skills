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

// Typecheck-only contract for class-variance-authority (mirrors its public types).
declare module "class-variance-authority" {
  type ClassValue = string | null | undefined | false
  type StringToBoolean<T> = T extends "true" | "false" ? boolean : T
  type ConfigSchema = Record<string, Record<string, ClassValue>>
  type ConfigVariants<T extends ConfigSchema> = {
    [Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | null | undefined
  }
  type Config<T extends ConfigSchema> = {
    variants?: T
    defaultVariants?: ConfigVariants<T>
    compoundVariants?: Array<ConfigVariants<T> & { class?: ClassValue; className?: ClassValue }>
  }
  type Props<T extends ConfigSchema> = ConfigVariants<T> & { class?: ClassValue; className?: ClassValue }
  export function cva<T extends ConfigSchema>(base?: ClassValue, config?: Config<T>): (props?: Props<T>) => string
  export type VariantProps<Component extends (...args: any) => any> = Omit<
    Exclude<Parameters<Component>[0], undefined>,
    "class" | "className"
  >
}
