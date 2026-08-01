# Form architecture

## Contents

- [Responsibility map](#responsibility-map)
- [Shared field foundation](#shared-field-foundation)
- [Slot-owned props](#slot-owned-props)
- [Accessibility relationships](#accessibility-relationships)
- [Create a typed feature form scope](#create-a-typed-feature-form-scope)
- [Keep the feature form contract cohesive](#keep-the-feature-form-contract-cohesive)
- [Placement and file boundaries](#placement-and-file-boundaries)

## Responsibility map

Use this dependency direction:

```text
feature form adapter
  -> form and field families
    -> repository form controller and design-system primitives

feature submit action
  -> feature server-state hook
    -> transport and backend contract

feature workflow adapter
  -> independent Form API + independent Stepper API
```

The form root provides form context and submission. A field root binds one
field and provides IDs, invalid state, disabled state, ref, value, and events.
Leaf slots render repository primitives. Schema and product policy stay in the
feature.

## Shared field foundation

Create shared infrastructure when several controls repeat the same controller
and accessibility logic:

```tsx
<InputFieldRoot control={form.control} name="title">
  <InputFieldLabel>Title</InputFieldLabel>
  <InputFieldControl placeholder="Quarterly plan" />
  <InputFieldDescription>Use a recognizable name.</InputFieldDescription>
  <InputFieldError />
</InputFieldRoot>
```

The foundation should provide stable non-visual bindings through context. Keep
control-specific value conversion and primitive providers inside the control
family rather than expanding the shared root into a switchboard.

A compact `<InputField label="..." />` may exist as a secondary API. Implement
it by composing `InputFieldRoot`, `InputFieldLabel`, `InputFieldControl`,
`InputFieldDescription`, and `InputFieldError`.

## Slot-owned props

Each part owns the props of what it renders:

- Root: controller props and outer Field or FieldSet props.
- Label: Label or Legend props.
- Control: Input, Textarea, Checkbox, RadioGroup, or primitive-root props.
- Trigger, value, content, item: corresponding Select primitive props.
- Description: FieldDescription props.
- Error: FieldError presentation props while internal errors remain authoritative.
- Layout/content: Field and FieldContent props.

Avoid:

```tsx
<SelectField
  triggerProps={{ className: "w-full" }}
  contentProps={{ align: "start" }}
/>
```

Prefer:

```tsx
<SelectFieldRoot control={form.control} name="surface">
  <SelectFieldLabel>Surface</SelectFieldLabel>
  <SelectFieldControl>
    <SelectFieldTrigger className="w-full">
      <SelectFieldValue placeholder="Choose one" />
    </SelectFieldTrigger>
    <SelectFieldContent align="start">
      <SelectFieldItem value="web">Web</SelectFieldItem>
    </SelectFieldContent>
  </SelectFieldControl>
  <SelectFieldError />
</SelectFieldRoot>
```

The explicit `SelectFieldControl` keeps the Radix provider around only the
trigger/value/content/item subtree. Field-level slots remain outside it.

## Accessibility relationships

Generate one control ID per field root. Derive description and error IDs from
it. The root supplies required bindings; consumers do not repeat them.

- Label `htmlFor` targets the control ID.
- Control receives `aria-invalid` only while invalid.
- `aria-describedby` includes a description ID only when that slot exists.
- It includes an error ID only while invalid and when an error slot exists.
- Radio groups use a semantic FieldSet/Legend or an explicit labelled-by link.
- Checkbox labels encompass or target the interactive control without hiding
  layout inside the label slot.

Reserve internally authoritative IDs and ARIA props from leaf prop types. Allow
compatible consumer ARIA such as `aria-label` when it does not break the field
relationship.

## Create a typed feature form scope

When several descendants need form methods, bind the feature's value type once:

```tsx
export const {
  Form: ProposalForm,
  useForm: useProposalForm,
} = createForm<ProposalValues>()
```

Keep state creation explicit at the feature entry:

```tsx
const form = useForm<ProposalValues>({
  resolver: zodResolver(proposalSchema),
  defaultValues: PROPOSAL_DEFAULT_VALUES,
})

return (
  <ProposalForm form={form} onSubmit={submitProposal}>
    <ProposalDetails />
  </ProposalForm>
)
```

Descendants call `useProposalForm()` and pass `form.control` to individual field
roots, preserving typed field-path inference without receiving the entire form
as a prop. The generic `createForm` factory should only bind `Form` and
`useFormContext` types. It must not instantiate React Hook Form, select a schema
resolver, own defaults, or absorb unrelated product context.

Use a separate feature context for non-form dependencies. Do not turn the form
scope into a general dependency container.

## Keep the feature form contract cohesive

Keep the shared form feature limited to reusable bindings and field families.
Keep one feature's closely related form contract together by default:

```text
features/proposal/
  components/
    proposal-details.tsx
    proposal-preview.tsx
  proposal-form.ts
  proposal-screen.tsx
```

`proposal-form.ts` may own the schema, inferred values, defaults, option
metadata, typed Form/hook pair, and a small local submit example. Focused
components own rendering and call the typed hook. The screen owns `useForm`,
resolver selection, and composition.

Split schema, types, constants, or submission into dedicated modules only when
they become independently reusable, acquire substantial logic, or follow a
strong repository convention. Do not create folders whose only purpose is to
hold one tiny private file.

## Placement and file boundaries

Follow the repository first. When creating a feature-scoped foundation from
scratch, a useful boundary is:

```text
features/form/
  compose-refs.ts
  components/
    form.tsx
    compound-field.tsx
    input-field.tsx
    select-field.tsx
```

Keep each cohesive public family in one file. Split the shared foundation and
cross-family helpers because several families depend on them. Keep product form
contracts and feature copy in the consuming feature.
