"use client"

import * as React from "react"
import {
  useController,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

type CompoundFieldContextValue = {
  controlDisabled: boolean | undefined
  controlId: string
  controlName: string
  controlOnBlur: () => void
  controlOnChange: (...event: unknown[]) => void
  controlRef: React.Ref<unknown>
  controlValue: unknown
  describedBy: string | undefined
  error: { message?: string } | undefined
  invalid: boolean
}

const CompoundFieldContext =
  React.createContext<CompoundFieldContextValue | null>(null)

export function useCompoundField(slot: string) {
  const field = React.useContext(CompoundFieldContext)

  if (!field) {
    throw new Error(`${slot} must be rendered inside its field root`)
  }

  return field
}

function containsSlot(children: React.ReactNode, slot: React.ElementType): boolean {
  let found = false

  React.Children.forEach(children, (child) => {
    if (found || !React.isValidElement<{ children?: React.ReactNode }>(child)) {
      return
    }

    found = child.type === slot || containsSlot(child.props.children, slot)
  })

  return found
}

export type CompoundFieldRootProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName> &
  Omit<
    React.ComponentProps<typeof Field>,
    "children" | "data-disabled" | "data-invalid" | "id"
  > & {
    children: React.ReactNode
    id?: string
  }

export function CompoundFieldRoot<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  children,
  control,
  defaultValue,
  disabled,
  id: idProp,
  name,
  rules,
  shouldUnregister,
  ...fieldProps
}: CompoundFieldRootProps<TFieldValues, TName>) {
  const generatedId = React.useId()
  const controlId = idProp ?? generatedId
  const descriptionId = `${controlId}-description`
  const errorId = `${controlId}-error`
  const controller = useController({
    control,
    defaultValue,
    disabled,
    name,
    rules,
    shouldUnregister,
  })
  const describedBy = [
    containsSlot(children, CompoundFieldDescription)
      ? descriptionId
      : undefined,
    containsSlot(children, CompoundFieldError) && controller.fieldState.invalid
      ? errorId
      : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined

  return (
    <CompoundFieldContext.Provider
      value={{
        controlDisabled: controller.field.disabled,
        controlId,
        controlName: controller.field.name,
        controlOnBlur: controller.field.onBlur,
        controlOnChange: controller.field.onChange,
        controlRef: controller.field.ref,
        controlValue: controller.field.value,
        describedBy,
        error: controller.fieldState.error,
        invalid: controller.fieldState.invalid,
      }}
    >
      <Field
        {...fieldProps}
        data-disabled={controller.field.disabled || undefined}
        data-invalid={controller.fieldState.invalid || undefined}
      >
        {children}
      </Field>
    </CompoundFieldContext.Provider>
  )
}

export type CompoundFieldLabelProps = Omit<
  React.ComponentProps<typeof FieldLabel>,
  "htmlFor"
>

export function CompoundFieldLabel(props: CompoundFieldLabelProps) {
  const field = useCompoundField("FieldLabel")

  return <FieldLabel {...props} htmlFor={field.controlId} />
}

export type CompoundFieldDescriptionProps = Omit<
  React.ComponentProps<typeof FieldDescription>,
  "id"
>

export function CompoundFieldDescription(
  props: CompoundFieldDescriptionProps
) {
  const field = useCompoundField("FieldDescription")

  return <FieldDescription {...props} id={`${field.controlId}-description`} />
}

export type CompoundFieldErrorProps = Omit<
  React.ComponentProps<typeof FieldError>,
  "errors" | "id"
>

export function CompoundFieldError(props: CompoundFieldErrorProps) {
  const field = useCompoundField("FieldError")

  if (!field.invalid) return null

  return (
    <FieldError
      {...props}
      id={`${field.controlId}-error`}
      errors={[field.error]}
    />
  )
}
