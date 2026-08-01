# Examples and adaptation

## Complete typed feature-form example

Read [../examples/typed-feature-form](../examples/typed-feature-form) before
creating a new form foundation or when a feature has several descendant form
sections. It demonstrates:

- an ordinary controlled `Form` that receives a React Hook Form instance;
- `createForm<T>()`, which binds a feature-specific Form and typed hook without
  owning `useForm`, Zod, defaults, or submission policy;
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
  hook pair, and its small local submit example;
- descendant components that call `useProposalForm()` instead of receiving a
  repeated `form` prop.

This is a non-runtime reference. It expects the target app's existing shadcn
Field, Input, and Select primitives. Adapt its paths, validation library,
styling, and product model to the repository; do not reinstall or rewrite those
primitives as part of the form abstraction.

## Example: refactor a large form component

User request:

```text
Split this account application form and remove form prop drilling.
```

Expected behavior:

1. Keep the schema, inferred values, defaults/options, typed Form/hook, and
   small private form helpers together in `<feature>-form.ts`.
2. Keep the React Hook Form `useForm` call in the feature entry.
3. Create one typed Form/hook pair for the feature.
4. Replace repeated `form: UseFormReturn<...>` section props with the typed hook.
5. Continue passing `form.control` at each compound field root when it is needed
   to infer and restrict the field path.
6. Extract only helpers shared by multiple field families, such as ref
   composition, from the individual field files into `utils/index.ts`.

## Example: do not hide form creation

Avoid a generic wrapper that accepts `schema` and silently calls `useForm`
inside itself. That design couples state creation, validation technology,
provider setup, and DOM rendering. It also prevents the parent from naturally
using form state for navigation, reset, server errors, or submission UI.

Prefer an explicit feature entry:

```tsx
const form = useForm<ApplicationValues>({
  resolver: zodResolver(applicationSchema),
  defaultValues: APPLICATION_DEFAULT_VALUES,
})

return <ApplicationForm form={form} onSubmit={submitApplication} />
```

## Example: preserve Form and Stepper independence

For a multi-step form, keep `useForm` and the typed Form scope independent from
Stepper state. A feature action component may call `useApplicationForm()`,
validate the active step's fields, and then call the separate Stepper API. Do
not add step state or step definitions to `createForm`, and do not create a
combined `StepperForm` component.

The same rule applies to layout and overlay primitives. Compose separate
components:

```tsx
<Card>
  <CardContent>
    <ApplicationFormRoot form={form} onSubmit={submitApplication} />
  </CardContent>
</Card>
```

Do not replace them with a `CardForm` that merges Card and Form props or logic.
