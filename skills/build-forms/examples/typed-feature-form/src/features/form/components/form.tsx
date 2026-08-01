"use client"

import * as React from "react"
import {
  FormProvider,
  useFormContext,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form"

export type FormProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues = TFieldValues,
> = Omit<
  React.ComponentProps<"form">,
  "onError" | "onInvalid" | "onSubmit"
> & {
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>
  onSubmit: SubmitHandler<TTransformedValues>
  onInvalid?: SubmitErrorHandler<TFieldValues>
}

export function Form<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues = TFieldValues,
>({
  form,
  onSubmit,
  onInvalid,
  noValidate = true,
  ...props
}: FormProps<TFieldValues, TContext, TTransformedValues>) {
  return (
    <FormProvider {...form}>
      <form
        noValidate={noValidate}
        {...props}
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      />
    </FormProvider>
  )
}

export function createForm<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues = TFieldValues,
>() {
  const TypedFormScope = React.createContext(false)

  function TypedForm(
    props: FormProps<TFieldValues, TContext, TTransformedValues>
  ) {
    return (
      <TypedFormScope.Provider value>
        <Form {...props} />
      </TypedFormScope.Provider>
    )
  }

  function useTypedForm() {
    const isInsideTypedForm = React.useContext(TypedFormScope)
    const form = useFormContext<
      TFieldValues,
      TContext,
      TTransformedValues
    >() as UseFormReturn<TFieldValues, TContext, TTransformedValues> | null

    if (!isInsideTypedForm || !form) {
      throw new Error("useForm must be called inside its typed Form")
    }

    return form
  }

  return { Form: TypedForm, useForm: useTypedForm } as const
}
