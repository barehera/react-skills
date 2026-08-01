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
  ...props
}: SelectFieldControlProps) {
  const field = useCompoundField("SelectFieldControl")

  return (
    <Select
      {...props}
      name={field.controlName}
      value={String(field.controlValue ?? "")}
      disabled={field.controlDisabled}
      onValueChange={(value) => {
        onValueChange?.(value)
        field.controlOnChange(value)
      }}
    />
  )
}

export type SelectFieldTriggerProps = Omit<
  React.ComponentProps<typeof SelectTrigger>,
  "aria-describedby" | "aria-invalid" | "id"
>

export function SelectFieldTrigger({
  onBlur,
  ref,
  ...props
}: SelectFieldTriggerProps) {
  const field = useCompoundField("SelectFieldTrigger")

  return (
    <SelectTrigger
      {...props}
      ref={composeRefs(ref, field.controlRef as React.Ref<HTMLButtonElement>)}
      id={field.controlId}
      aria-describedby={field.describedBy}
      aria-invalid={field.invalid || undefined}
      onBlur={(event) => {
        onBlur?.(event)
        if (!event.defaultPrevented) field.controlOnBlur()
      }}
    />
  )
}
