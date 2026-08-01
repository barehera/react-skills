# Form architecture

## Contents

- [Responsibility map](#responsibility-map)
- [Shared field foundation](#shared-field-foundation)
- [Slot-owned props](#slot-owned-props)
- [Accessibility relationships](#accessibility-relationships)
- [Separate feature artifacts](#separate-feature-artifacts)
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

## Separate feature artifacts

Keep the shared form feature limited to reusable bindings and field families.
For a non-trivial consuming form, split product artifacts by responsibility:

```text
features/launch-brief/
  components/
    concept-step.tsx
    delivery-step.tsx
    launch-brief-actions.tsx
  constants/
    launch-brief.ts
  logic/
    find-invalid-step.ts
    submit-launch-brief.ts
  schemas/
    launch-brief-schema.ts
  types/
    launch-brief.ts
  launch-brief-form.tsx
```

The entry component owns composition and local orchestration. Schema files own
validation rules, types expose inferred public contracts, constants own
defaults/options/step metadata, logic modules own non-visual operations, and
focused components own rendering. Do not keep these in one large form module or
move them into `features/form` merely because they participate in a form.

Adapt folder names to repository conventions and keep a genuinely small form
colocated. Separation should clarify ownership, not create one-line files.

## Placement and file boundaries

Follow the repository first. When creating a feature-scoped foundation from
scratch, a useful boundary is:

```text
features/form/
  components/
    form.tsx
    compound-field.tsx
    input-field.tsx
    select-field.tsx
  logic/
    compose-refs.ts
    get-field-control-props.ts
  constants/
    field.ts
```

Keep each cohesive public family in one file. Split the shared foundation and
generic logic because several families depend on them. Keep schemas, defaults,
step definitions, submit mutations, and feature copy in the consuming feature.
