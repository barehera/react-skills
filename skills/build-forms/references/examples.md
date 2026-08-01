# Examples and adaptation

## Complete typed feature-form example

Read [../examples/typed-feature-form](../examples/typed-feature-form) before
creating a new form foundation or when a feature has several descendant form
sections. It demonstrates:

- an ordinary controlled `Form` that receives a React Hook Form instance;
- `createForm<T>()`, which binds a feature-specific Form and typed hook without
  owning `useForm`, Zod, defaults, or submission policy;
- a compound `InputField` whose slots own their natural primitive props;
- separated schema, inferred type, defaults, submission logic, and components;
- descendant components that call `useProposalForm()` instead of receiving a
  repeated `form` prop.

This is a non-runtime reference. Adapt its paths, validation library, field
primitives, styling, and product model to the repository. Reuse existing shadcn
Field and Input primitives rather than copying the example's native elements
when the target project provides them.

## Example: refactor a large form component

User request:

```text
Split this account application form and remove form prop drilling.
```

Expected behavior:

1. Keep the schema, inferred values, defaults/options, non-visual logic, and
   focused UI sections in separate feature modules.
2. Keep the React Hook Form `useForm` call in the feature entry.
3. Create one typed Form/hook pair for the feature.
4. Replace repeated `form: UseFormReturn<...>` section props with the typed hook.
5. Continue passing `form.control` at each compound field root when it is needed
   to infer and restrict the field path.

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
not add step state or step definitions to `createForm`.
