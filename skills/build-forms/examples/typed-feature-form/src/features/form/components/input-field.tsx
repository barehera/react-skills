"use client"

import * as React from "react"
import {
  useController,
  type FieldPathByValue,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form"

type InputFieldContextValue = {
  controlId: string
  describedBy: string | undefined
  disabled: boolean | undefined
  error: string | undefined
  invalid: boolean
  name: string
  onBlur: () => void
  onChange: (...event: unknown[]) => void
  ref: React.Ref<HTMLInputElement>
  value: unknown
}

const InputFieldContext = React.createContext<InputFieldContextValue | null>(null)

function useInputField(slot: string) {
  const field = React.useContext(InputFieldContext)

  if (!field) {
    throw new Error(`${slot} must be rendered inside InputFieldRoot`)
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

export type InputFieldRootProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
> = UseControllerProps<TFieldValues, TName> &
  Omit<React.ComponentProps<"div">, "children" | "defaultValue"> & {
    children: React.ReactNode
    id?: string
  }

export function InputFieldRoot<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
>({
  children,
  control,
  defaultValue,
  disabled,
  id: idProp,
  name,
  rules,
  shouldUnregister,
  ...rootProps
}: InputFieldRootProps<TFieldValues, TName>) {
  const generatedId = React.useId()
  const descriptionId = `${idProp ?? generatedId}-description`
  const errorId = `${idProp ?? generatedId}-error`
  const controller = useController({
    control,
    defaultValue,
    disabled,
    name,
    rules,
    shouldUnregister,
  })
  const hasDescription = containsSlot(children, InputFieldDescription)
  const hasError = containsSlot(children, InputFieldError)
  const describedBy = [
    hasDescription ? descriptionId : undefined,
    hasError && controller.fieldState.invalid ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined

  return (
    <InputFieldContext.Provider
      value={{
        controlId: idProp ?? generatedId,
        describedBy,
        disabled: controller.field.disabled,
        error: controller.fieldState.error?.message,
        invalid: controller.fieldState.invalid,
        name: controller.field.name,
        onBlur: controller.field.onBlur,
        onChange: controller.field.onChange,
        ref: controller.field.ref,
        value: controller.field.value,
      }}
    >
      <div
        {...rootProps}
        data-disabled={controller.field.disabled || undefined}
        data-invalid={controller.fieldState.invalid || undefined}
      >
        {children}
      </div>
    </InputFieldContext.Provider>
  )
}

export type InputFieldLabelProps = Omit<
  React.ComponentProps<"label">,
  "htmlFor"
>

export function InputFieldLabel(props: InputFieldLabelProps) {
  const field = useInputField("InputFieldLabel")

  return <label {...props} htmlFor={field.controlId} />
}

export type InputFieldControlProps = Omit<
  React.ComponentProps<"input">,
  | "aria-describedby"
  | "aria-invalid"
  | "defaultValue"
  | "disabled"
  | "id"
  | "name"
  | "value"
>

export function InputFieldControl({
  onBlur,
  onChange,
  ref,
  ...props
}: InputFieldControlProps) {
  const field = useInputField("InputFieldControl")

  return (
    <input
      {...props}
      ref={composeRefs(ref, field.ref)}
      id={field.controlId}
      name={field.name}
      value={String(field.value ?? "")}
      disabled={field.disabled}
      aria-describedby={field.describedBy}
      aria-invalid={field.invalid || undefined}
      onBlur={(event) => {
        onBlur?.(event)
        if (!event.defaultPrevented) field.onBlur()
      }}
      onChange={(event) => {
        onChange?.(event)
        if (!event.defaultPrevented) field.onChange(event)
      }}
    />
  )
}

export type InputFieldDescriptionProps = Omit<
  React.ComponentProps<"p">,
  "id"
>

export function InputFieldDescription(props: InputFieldDescriptionProps) {
  const field = useInputField("InputFieldDescription")

  return <p {...props} id={`${field.controlId}-description`} />
}

export type InputFieldErrorProps = Omit<
  React.ComponentProps<"p">,
  "children" | "id" | "role"
>

export function InputFieldError(props: InputFieldErrorProps) {
  const field = useInputField("InputFieldError")

  if (!field.error) return null

  return (
    <p {...props} id={`${field.controlId}-error`} role="alert">
      {field.error}
    </p>
  )
}

function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === "function") return ref(node)
      if (ref) ref.current = node
      return undefined
    })

    return () => {
      for (const cleanup of cleanups) {
        if (typeof cleanup === "function") cleanup()
      }
    }
  }
}
