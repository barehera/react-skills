"use client"

import * as React from "react"
import { type FieldPathByValue, type FieldValues } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { composeRefs } from "../utils"
import {
  CompoundFieldDescription,
  CompoundFieldError,
  CompoundFieldLabel,
  CompoundFieldRoot,
  useCompoundField,
  type CompoundFieldDescriptionProps,
  type CompoundFieldErrorProps,
  type CompoundFieldLabelProps,
  type CompoundFieldRootProps,
} from "./form"

const SelectFieldControlContext = React.createContext<boolean | null>(null)

export type SelectFieldRootProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
> = CompoundFieldRootProps<TFieldValues, TName>

export function SelectFieldRoot<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
>(props: SelectFieldRootProps<TFieldValues, TName>) {
  return <CompoundFieldRoot orientation="responsive" {...props} />
}

export const SelectFieldLabel = CompoundFieldLabel
export const SelectFieldDescription = CompoundFieldDescription
export const SelectFieldError = CompoundFieldError
export const SelectFieldValue = SelectValue
export const SelectFieldContent = SelectContent
export const SelectFieldItem = SelectItem

export type SelectFieldLabelProps = CompoundFieldLabelProps
export type SelectFieldDescriptionProps = CompoundFieldDescriptionProps
export type SelectFieldErrorProps = CompoundFieldErrorProps
export type SelectFieldValueProps = React.ComponentProps<typeof SelectValue>
export type SelectFieldContentProps = React.ComponentProps<typeof SelectContent>
export type SelectFieldItemProps = React.ComponentProps<typeof SelectItem>

export type SelectFieldControlProps = Omit<
  React.ComponentProps<typeof Select>,
  "defaultValue" | "disabled" | "name" | "value"
>

export function SelectFieldControl({
  onValueChange,
  required,
  ...props
}: SelectFieldControlProps) {
  const field = useCompoundField("SelectFieldControl")

  return (
    <SelectFieldControlContext.Provider value={Boolean(required)}>
      <Select
        {...props}
        name={field.controlName}
        value={String(field.controlValue ?? "")}
        disabled={field.controlDisabled}
        required={required}
        onValueChange={(value) => {
          onValueChange?.(value)
          field.controlOnChange(value)
        }}
      />
    </SelectFieldControlContext.Provider>
  )
}

export type SelectFieldTriggerProps = Omit<
  React.ComponentProps<typeof SelectTrigger>,
  | "aria-describedby"
  | "aria-errormessage"
  | "aria-invalid"
  | "aria-required"
  | "id"
>

export function SelectFieldTrigger({
  onBlur,
  ref,
  ...props
}: SelectFieldTriggerProps) {
  const field = useCompoundField("SelectFieldTrigger")
  const required = React.useContext(SelectFieldControlContext)

  if (required === null) {
    throw new Error("SelectFieldTrigger must be inside SelectFieldControl")
  }

  return (
    <SelectTrigger
      {...props}
      ref={composeRefs(ref, field.controlRef as React.Ref<HTMLButtonElement>)}
      id={field.controlId}
      aria-describedby={field.describedBy}
      aria-errormessage={field.errorMessageId}
      aria-invalid={field.invalid || undefined}
      aria-required={required || undefined}
      onBlur={(event) => {
        onBlur?.(event)
        if (!event.defaultPrevented) field.controlOnBlur()
      }}
    />
  )
}
