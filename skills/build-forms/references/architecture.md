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

feature screen composition
  -> independent Card/Dialog/Sheet API + independent Form API
```

The form root provides form context and submission. A field root binds one
field and provides IDs, invalid state, disabled state, ref, value, and events.
Leaf slots render repository primitives. Schema and product policy stay in the
feature. Surrounding layout and navigation components keep their own public
contracts; nesting components does not justify merging their responsibilities.

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
- `aria-errormessage` references that visible error slot only while invalid.
- Native required controls keep `required` and reflect `aria-required`; custom
  controls propagate the same required state to their interactive element.
- Radio groups use a semantic FieldSet/Legend or an explicit labelled-by link.
- Checkbox labels encompass or target the interactive control without hiding
  layout inside the label slot.

Reserve internally authoritative IDs and ARIA props from leaf prop types. Allow
compatible consumer ARIA such as `aria-label` when it does not break the field
relationship.

## Create a typed feature form scope

When several descendants need form methods, bind the feature's value type once:

```tsx
export type ProposalForm = z.infer<typeof proposalSchema>

export const {
  Form: ProposalFormRoot,
  useForm: useProposalForm,
} = createForm<ProposalForm>()
```

Pass form configuration directly to the typed root:

```tsx
return (
  <ProposalFormRoot
    resolver={zodResolver(proposalSchema)}
    defaultValues={PROPOSAL_DEFAULT_VALUES}
    mode="onBlur"
    onSubmit={submitProposal}
  >
    <ProposalDetails />
  </ProposalFormRoot>
)
```

Descendants call `useProposalForm()` and pass `form.control` to individual field
roots, preserving typed field-path inference without receiving the entire form
as a prop. The generic `createForm` factory binds the value type to a Form root
and hook. The root accepts React Hook Form's configuration props directly and
instantiates `useForm` once. The consuming feature still chooses the resolver,
defaults, mode, and other options; the factory must not hard-code product
configuration or absorb unrelated product context.

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
    proposal-submit.tsx
  proposal-form.ts
  proposal-screen.tsx
```

`proposal-form.ts` may own the schema, inferred values, defaults, option
metadata, typed Form/hook pair, and a small local submit example. Focused
components own rendering and call the typed hook. The screen chooses the
resolver/options and owns composition; the typed root owns the single `useForm`
call.

Split schema, types, constants, or submission into dedicated modules only when
they become independently reusable, acquire substantial logic, or follow a
strong repository convention. Do not create folders whose only purpose is to
hold one tiny private file.

## Placement and file boundaries

Follow the repository first. When creating a feature-scoped foundation from
scratch, a useful boundary is:

```text
features/form/
  components/
    form.tsx
    input-field.tsx
    select-field.tsx
  utils/
    index.ts
```

Keep each cohesive public family in one file. `components/form.tsx` may own the
generic Form/provider factory and compound-field context/controller foundation
when they are one reusable boundary, while still exporting them as separate
components. Put small non-visual helpers shared across families directly in
`utils/index.ts`. Import component modules directly; do not add barrels whose
only job is to re-export neighboring files. Keep product form contracts and
feature copy in the consuming feature.
