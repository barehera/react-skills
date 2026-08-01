"use client"

import * as React from "react"
import {
  FormProvider,
  useController,
  useForm,
  useFormContext as useReactHookFormContext,
  type FieldPath,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseControllerProps,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form"
import { useStore, type StoreApi } from "zustand"
import { createStore } from "zustand/vanilla"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

export type FormProps<
  TFieldValues extends FieldValues,
  TResolverContext = unknown,
  TTransformedValues = TFieldValues,
> = Omit<
  React.ComponentProps<"form">,
  "onError" | "onInvalid" | "onSubmit"
> &
  UseFormProps<TFieldValues, TResolverContext, TTransformedValues> & {
    onSubmit: SubmitHandler<TTransformedValues>
    onInvalid?: SubmitErrorHandler<TFieldValues>
  }

export function Form<
  TFieldValues extends FieldValues,
  TResolverContext = unknown,
  TTransformedValues = TFieldValues,
>({
  context,
  criteriaMode,
  defaultValues,
  delayError,
  disabled,
  errors,
  formControl,
  mode,
  onSubmit,
  onInvalid,
  noValidate = true,
  progressive,
  resetOptions,
  resolver,
  reValidateMode,
  shouldFocusError,
  shouldUnregister,
  shouldUseNativeValidation,
  validate,
  values,
  ...props
}: FormProps<TFieldValues, TResolverContext, TTransformedValues>) {
  const form = useForm<TFieldValues, TResolverContext, TTransformedValues>({
    context,
    criteriaMode,
    defaultValues,
    delayError,
    disabled,
    errors,
    formControl,
    mode,
    progressive,
    resetOptions,
    resolver,
    reValidateMode,
    shouldFocusError,
    shouldUnregister,
    shouldUseNativeValidation,
    validate,
    values,
  })

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

type EmptyFormProperties = Record<never, never>

type FormPropertiesProp<TProperties extends object> =
  keyof TProperties extends never
    ? { properties?: TProperties }
    : { properties: TProperties }

type TypedFormProps<
  TFieldValues extends FieldValues,
  TProperties extends object,
  TResolverContext,
  TTransformedValues,
> = FormProps<TFieldValues, TResolverContext, TTransformedValues> &
  FormPropertiesProp<TProperties>

export function createForm<
  TFieldValues extends FieldValues,
  TProperties extends object = EmptyFormProperties,
  TResolverContext = unknown,
  TTransformedValues = TFieldValues,
>() {
  const TypedFormPropertiesContext =
    React.createContext<StoreApi<TProperties> | null>(null)

  function TypedForm({
    properties = {} as TProperties,
    ...props
  }: TypedFormProps<
    TFieldValues,
    TProperties,
    TResolverContext,
    TTransformedValues
  >) {
    const [propertiesStore] = React.useState(() =>
      createStore<TProperties>()(() => properties)
    )

    React.useLayoutEffect(() => {
      propertiesStore.setState(properties, true)
    }, [properties, propertiesStore])

    return (
      <TypedFormPropertiesContext.Provider value={propertiesStore}>
        <Form {...props} />
      </TypedFormPropertiesContext.Provider>
    )
  }

  function useTypedForm() {
    const propertiesStore = React.useContext(TypedFormPropertiesContext)
    const form = useReactHookFormContext<
      TFieldValues,
      TResolverContext,
      TTransformedValues
    >() as UseFormReturn<
      TFieldValues,
      TResolverContext,
      TTransformedValues
    > | null

    if (!propertiesStore || !form) {
      throw new Error("useForm must be called inside its typed Form")
    }

    return form
  }

  function useTypedFormProperties<TSelected>(
    selector: (properties: TProperties) => TSelected
  ) {
    const store = React.useContext(TypedFormPropertiesContext)

    if (!store) {
      throw new Error("useProperties must be called inside its typed Form")
    }

    return useStore(store, selector)
  }

  return {
    Form: TypedForm,
    useForm: useTypedForm,
    useProperties: useTypedFormProperties,
  } as const
}

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
  errorMessageId: string | undefined
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
  const hasError =
    containsSlot(children, CompoundFieldError) && controller.fieldState.invalid
  const errorMessageId = hasError ? errorId : undefined
  const describedBy = [
    containsSlot(children, CompoundFieldDescription)
      ? descriptionId
      : undefined,
    errorMessageId,
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
        errorMessageId,
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
