"use client"

import * as React from "react"
import { type FieldPathByValue, type FieldValues } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { composeRefs } from "../compose-refs"
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
} from "./compound-field"

export type InputFieldRootProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
> = CompoundFieldRootProps<TFieldValues, TName>

export function InputFieldRoot<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
>(props: InputFieldRootProps<TFieldValues, TName>) {
  return <CompoundFieldRoot {...props} />
}

export const InputFieldLabel = CompoundFieldLabel
export const InputFieldDescription = CompoundFieldDescription
export const InputFieldError = CompoundFieldError

export type InputFieldLabelProps = CompoundFieldLabelProps
export type InputFieldDescriptionProps = CompoundFieldDescriptionProps
export type InputFieldErrorProps = CompoundFieldErrorProps

export type InputFieldControlProps = Omit<
  React.ComponentProps<typeof Input>,
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
  const field = useCompoundField("InputFieldControl")

  return (
    <Input
      {...props}
      ref={composeRefs(ref, field.controlRef as React.Ref<HTMLInputElement>)}
      id={field.controlId}
      name={field.controlName}
      value={String(field.controlValue ?? "")}
      disabled={field.controlDisabled}
      aria-describedby={field.describedBy}
      aria-invalid={field.invalid || undefined}
      onBlur={(event) => {
        onBlur?.(event)
        if (!event.defaultPrevented) field.controlOnBlur()
      }}
      onChange={(event) => {
        onChange?.(event)
        if (!event.defaultPrevented) field.controlOnChange(event)
      }}
    />
  )
}
