"use client"

import * as React from "react"
import {
  type FieldPathByValue,
  type FieldValues,
  type PathValue,
} from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

export type SelectFieldOption<TValue extends string = string> = {
  value: TValue
  label: React.ReactNode
  disabled?: boolean
}

export type SelectFieldSlotProps = CompactFieldSlotProps & {
  select?: Omit<SelectFieldControlProps, "children" | "required">
  selectTrigger?: Omit<SelectFieldTriggerProps, "children">
  selectValue?: Omit<SelectFieldValueProps, "placeholder">
  selectContent?: Omit<SelectFieldContentProps, "children">
  selectItem?: Omit<SelectFieldItemProps, "children" | "disabled" | "value">
}

export type SelectFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
> = CompactFieldProps<TFieldValues, TName> & {
  options: ReadonlyArray<
    SelectFieldOption<PathValue<TFieldValues, TName> & string>
  >
  placeholder?: React.ReactNode
  required?: boolean
  slotProps?: SelectFieldSlotProps
}

export function SelectField<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, string>,
>({
  control,
  description,
  disabled,
  label,
  name,
  options,
  placeholder,
  required,
  shouldUnregister,
  slotProps = {},
}: SelectFieldProps<TFieldValues, TName>) {
  const {
    select,
    selectContent,
    selectItem,
    selectTrigger,
    selectValue,
    ...fieldSlotProps
  } = slotProps

  return (
    <CompactField
      control={control}
      description={description}
      disabled={disabled}
      label={label}
      name={name}
      shouldUnregister={shouldUnregister}
      slotProps={{
        ...fieldSlotProps,
        field: { orientation: "responsive", ...fieldSlotProps.field },
      }}
    >
      <SelectFieldControl {...select} required={required}>
        <SelectFieldTrigger {...selectTrigger}>
          <SelectFieldValue {...selectValue} placeholder={placeholder} />
        </SelectFieldTrigger>
        <SelectFieldContent {...selectContent}>
          {options.map((option) => (
            <SelectFieldItem
              {...selectItem}
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectFieldItem>
          ))}
        </SelectFieldContent>
      </SelectFieldControl>
    </CompactField>
  )
}
