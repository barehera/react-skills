"use client"

import * as React from "react"
import { type FieldPathByValue, type FieldValues } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { composeRefs } from "@/lib/compose-refs"
import {
  CompactField,
  CompoundFieldDescription,
  CompoundFieldError,
  CompoundFieldLabel,
  CompoundFieldRoot,
  useCompoundField,
  type CompactFieldProps,
  type CompactFieldSlotProps,
  type CompoundFieldDescriptionProps,
  type CompoundFieldErrorProps,
  type CompoundFieldLabelProps,
  type CompoundFieldRootProps,
} from "./form"

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
  | "aria-errormessage"
  | "aria-invalid"
  | "aria-required"
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
  required,
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
      required={required}
      aria-describedby={field.describedBy}
      aria-errormessage={field.errorMessageId}
      aria-invalid={field.invalid || undefined}
      aria-required={required || undefined}
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

export type InputFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
> = CompactFieldProps<TFieldValues, TName> &
  InputFieldControlProps & {
    slotProps?: CompactFieldSlotProps
  }

export function InputField<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
>({
  control,
  description,
  disabled,
  label,
  name,
  shouldUnregister,
  slotProps,
  ...inputProps
}: InputFieldProps<TFieldValues, TName>) {
  return (
    <CompactField
      control={control}
      description={description}
      disabled={disabled}
      label={label}
      name={name}
      shouldUnregister={shouldUnregister}
      slotProps={slotProps}
    >
      <InputFieldControl {...inputProps} />
    </CompactField>
  )
}
