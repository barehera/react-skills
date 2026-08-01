// Typecheck-only contracts for shadcn primitives expected in the target app.
// This declaration is validation infrastructure, not a published skill file.

declare module "@/components/ui/button" {
  import type * as React from "react"

  export function Button(
    props: React.ComponentPropsWithRef<"button">
  ): React.ReactElement
}

declare module "@/components/ui/field" {
  import type * as React from "react"

  type FieldProps = React.ComponentProps<"div"> & {
    orientation?: "vertical" | "horizontal" | "responsive"
  }

  export function Field(props: FieldProps): React.ReactElement
  export function FieldLabel(
    props: React.ComponentProps<"label">
  ): React.ReactElement
  export function FieldDescription(
    props: React.ComponentProps<"p">
  ): React.ReactElement
  export function FieldError(
    props: React.ComponentProps<"div"> & {
      errors?: Array<{ message?: string } | undefined>
    }
  ): React.ReactElement | null
}

declare module "@/components/ui/input" {
  import type * as React from "react"

  export function Input(
    props: React.ComponentPropsWithRef<"input">
  ): React.ReactElement
}

declare module "@/components/ui/select" {
  import type * as React from "react"

  export function Select(props: {
    children?: React.ReactNode
    defaultValue?: string
    disabled?: boolean
    name?: string
    onValueChange?: (value: string) => void
    required?: boolean
    value?: string
  }): React.ReactElement

  export function SelectTrigger(
    props: React.ComponentProps<"button"> & {
      size?: "sm" | "default" | "lg"
    }
  ): React.ReactElement

  export function SelectValue(props: {
    placeholder?: React.ReactNode
  }): React.ReactElement

  export function SelectContent(
    props: React.ComponentProps<"div"> & {
      align?: "start" | "center" | "end"
      position?: "item-aligned" | "popper"
    }
  ): React.ReactElement

  export function SelectItem(
    props: React.ComponentProps<"div"> & {
      disabled?: boolean
      value: string
    }
  ): React.ReactElement
}
