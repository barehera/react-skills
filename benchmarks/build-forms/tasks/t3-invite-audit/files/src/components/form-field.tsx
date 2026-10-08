import * as React from "react"
import {
  get,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { isPersonalEmail } from "@/features/members/policy"

type FormFieldProps<TValues extends FieldValues> = {
  form: UseFormReturn<TValues>
  name: Path<TValues>
  label: string
  description?: string
  labelProps?: React.ComponentProps<typeof FieldLabel>
  inputProps?: React.ComponentProps<typeof Input>
}

export function FormField<TValues extends FieldValues>({
  form,
  name,
  label,
  description,
  labelProps,
  inputProps,
}: FormFieldProps<TValues>) {
  const id = name.replaceAll(".", "-")
  const error = get(form.formState.errors, name) as
    | { message?: string }
    | undefined
  const value = form.watch(name)
  const showPersonalEmailWarning =
    name.endsWith("email") && typeof value === "string" && isPersonalEmail(value)

  return (
    <Field>
      <FieldLabel htmlFor={id} {...labelProps}>
        {label}
      </FieldLabel>
      <Input
        id={id}
        autoComplete="off"
        aria-describedby={`${id}-description ${id}-error`}
        {...form.register(name)}
        {...inputProps}
      />
      {description ? (
        <FieldDescription id={`${id}-description`}>{description}</FieldDescription>
      ) : null}
      {showPersonalEmailWarning ? (
        <p className="text-sm text-amber-600">
          Personal email addresses can't be invited.
        </p>
      ) : null}
      {error?.message ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error.message}
        </p>
      ) : null}
    </Field>
  )
}
