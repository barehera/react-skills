# Examples and adaptation

## Contents

- [Complete typed feature-form example](#complete-typed-feature-form-example)
- [Refactor a large form component](#example-refactor-a-large-form-component)
- [Inject typed form-wide properties](#example-inject-typed-form-wide-properties)
- [Keep form configuration explicit](#example-keep-form-configuration-explicit)
- [Preserve Form and Stepper independence](#example-preserve-form-and-stepper-independence)

## Complete typed feature-form example

Read [../examples/typed-feature-form](../examples/typed-feature-form) before
creating a new form foundation or when a feature has several descendant form
sections. It demonstrates:

- a Form root that accepts React Hook Form configuration props and creates the
  form instance once;
- `createForm<T, TProperties>()`, which binds a feature-specific Form root,
  typed form hook, and optional typed properties selector without hard-coding
  Zod, defaults, mode, or submission policy;
- one `components/form.tsx` module for the generic Form/provider factory and
  the compound-field controller/accessibility foundation they share;
- compound Input and Select fields that wrap existing shadcn primitives and
  expose slot-owned props;
- shared invalid, error-message, and required-state ARIA bindings without
  repeated consumer props, while semantic browser hints remain Control props;
- a shared `composeRefs` implementation defined directly in `utils/index.ts`,
  outside either field module;
- direct component-module imports without barrel exports;
- one cohesive `proposal-form.ts` containing schema, inferred values, defaults,
  option metadata, a `ProposalForm` value type, the `ProposalFormRoot`/typed
  hooks, and its small local submit example;
- descendant components that call `useProposalForm()` instead of receiving a
  repeated `form` prop;
- a submit component that reads `isSubmitting` from `useProposalForm()` inside
  the root instead of requiring a second `useForm` call at the screen;
- optional external form-wide properties supplied once at the root and consumed
  through typed Zustand selectors in separate descendants.

This is a non-runtime reference. It expects the target app's existing shadcn
Field, Input, Select, and Button primitives. Adapt its paths, validation library,
styling, and product model to the repository; do not reinstall or rewrite those
primitives as part of the form abstraction. The scoped properties example also
expects the current Zustand vanilla-store and `useStore` APIs.

## Example: refactor a large form component

User request:

```text
Split this account application form and remove form prop drilling.
```

Expected behavior:

1. Keep the schema, inferred values, defaults/options, typed Form/hook, and
   small private form helpers together in `<feature>-form.ts`.
2. Create one typed Form/hook pair for the feature; let its root call `useForm`
   once from the configuration props it receives.
3. Pass resolver, defaults, mode, and other `UseFormProps` directly to the
   typed root.
4. Replace repeated `form: UseFormReturn<...>` section props with the typed hook.
5. Continue passing `form.control` at each compound field root when it is needed
   to infer and restrict the field path.
6. Extract only helpers shared by multiple field families, such as ref
   composition, from the individual field files into `utils/index.ts`.
7. If form-wide external properties are needed, bind their type as the second
   `createForm` generic, pass them once through the root's `properties` prop,
   and select narrow slices with the returned `useProperties` hook.

## Example: inject typed form-wide properties

Use the optional properties channel for external dependencies or UI policy
needed by several descendants but not represented in submitted values:

```tsx
type ApplicationFormProperties = {
  reviewGroupName: string
  submissionDisabled: boolean
}

const {
  Form: ApplicationFormRoot,
  useForm: useApplicationForm,
  useProperties: useApplicationFormProperties,
} = createForm<ApplicationForm, ApplicationFormProperties>()
```

The root requires the declared properties:

```tsx
<ApplicationFormRoot
  properties={{ reviewGroupName, submissionDisabled }}
  defaultValues={APPLICATION_DEFAULT_VALUES}
  onSubmit={submitApplication}
>
  <ApplicationDetails />
  <ApplicationSubmit />
</ApplicationFormRoot>
```

Consume a narrow Zustand slice instead of prop drilling or reading the whole
object:

```tsx
const submissionDisabled = useApplicationFormProperties(
  (properties) => properties.submissionDisabled
)
```

Do not put submitted values, Stepper state, cached server records, or unrelated
screen state into this store. React Hook Form, Stepper, and the server-state
layer retain those responsibilities.

## Example: keep form configuration explicit

Avoid a factory that accepts a schema or defaults when it is created and hides
product choices permanently. Bind only the feature value type in
`createForm<T>()`. Let the resulting root accept the same resolver, defaults,
mode, values, reset, focus, validation, and context options as `useForm`.

Prefer explicit root configuration without a duplicate hook call:

```tsx
<ApplicationFormRoot
  resolver={zodResolver(applicationSchema)}
  defaultValues={APPLICATION_DEFAULT_VALUES}
  mode="onBlur"
  onSubmit={submitApplication}
/>
```

Any descendant that needs reset, navigation validation, server errors, or
submission state calls the feature-typed hook inside the root.

## Example: preserve Form and Stepper independence

For a multi-step form, keep form state and the typed Form scope independent from
Stepper state. A feature action component may call `useApplicationForm()`,
validate the active step's fields, and then call the separate Stepper API. Do
not add step state or step definitions to `createForm`, and do not create a
combined `StepperForm` component.

The same rule applies to layout and overlay primitives. Compose separate
components:

```tsx
<Card>
  <CardContent>
    <ApplicationFormRoot
      defaultValues={APPLICATION_DEFAULT_VALUES}
      onSubmit={submitApplication}
    />
  </CardContent>
</Card>
```

Do not replace them with a `CardForm` that merges Card and Form props or logic.
