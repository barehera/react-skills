# Form architecture

How to implement the field-family and feature-form contracts in `SKILL.md`.

## Contents

- [Shared field foundation](#shared-field-foundation)
- [Slot-owned props](#slot-owned-props)
- [Accessibility relationships](#accessibility-relationships)
- [Typed feature form](#typed-feature-form)
- [Form-wide properties](#form-wide-properties)
- [Placement](#placement)

## Shared field foundation

The form root provides form context and submission. A field root binds one
field and provides IDs, invalid state, disabled state, ref, value, and events
through one shared context; leaf slots render repository primitives. Keep
control-specific value conversion and primitive providers inside the control
family rather than expanding the shared root into a switchboard.

## Slot-owned props

Each part owns the props of what it renders:

- Root: controller props and outer Field or FieldSet props.
- Label: Label or Legend props.
- Control: Input, Textarea, Checkbox, RadioGroup, or primitive-root props.
- Trigger, value, content, item: the corresponding Select primitive props.
- Description: FieldDescription props.
- Error: FieldError presentation props; internal errors remain authoritative.
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

`SelectFieldControl` keeps the Radix provider around only the
trigger/value/content/item subtree; field-level slots remain outside it.

## Accessibility relationships

Generate one control ID per field root and derive description and error IDs
from it. The root supplies these bindings; consumers do not repeat them.
Besides the `aria-describedby`, `aria-errormessage`, and `required` rules in
`SKILL.md`:

- Label `htmlFor` targets the control ID.
- The form-library `name`, value, disabled state, ref, change, and blur
  bindings reach the actual interactive element.
- The control receives `aria-invalid` only while invalid.
- Radio groups use a semantic FieldSet/Legend or an explicit labelled-by link.
- Checkbox labels encompass or target the interactive control without hiding
  layout inside the label slot.

Omit internally authoritative IDs and ARIA props from leaf prop types; allow
compatible consumer ARIA such as `aria-label` when it does not break the field
relationship. Native semantics come first: ARIA augments a custom control and
never replaces a real label, input, select, button, fieldset, or form.

## Typed feature form

`createForm<Values, Properties>()` binds the feature's value type, and an
optional properties type, to a Form root, a typed `useForm` hook, and a
`useProperties` selector hook
([proposal-form.ts](../examples/typed-feature-form/src/features/proposal/proposal-form.ts)).
It never receives a schema, defaults, or mode, because a factory that captures
them hides product choices permanently. The root accepts the same resolver,
defaults, mode, values, reset, focus, validation, and resolver-context options
as `useForm`, and the screen chooses them
([proposal-screen.tsx](../examples/typed-feature-form/src/features/proposal/proposal-screen.tsx)).

Descendants call `useProposalForm()` and pass `form.control` to each field
root, which keeps typed field-path inference without receiving the whole form
as a prop. A descendant that needs reset, step validation, server errors, or
submission state calls the typed hook inside the root instead of a second
`useForm` at the screen.

The screen hands submission to the feature's mutation hook, not a placeholder
function. The mutation, its Axios call, and its response schema live in the
feature's `server-state` folder and follow `$manage-server-state`; the typed
form never imports TanStack Query, and the screen connects the two owners.

## Form-wide properties

Use `properties` for external dependencies or UI policy that several
descendants need but that are not submitted values, such as a review group
name or a submission lock. The root creates one vanilla Zustand store per
mount; React context transports only the stable `StoreApi`, and descendants
select narrow slices:

```tsx
const reviewGroupName = useProposalFormProperties(
  (properties) => properties.reviewGroupName
)
```

Submitted values, Stepper state, cached server records, and unrelated screen
state never go in this store; React Hook Form, the Stepper, and the
server-state layer own them. The name `properties` avoids a collision with
React Hook Form's resolver `context` option.

## Placement

Follow the repository first. From scratch:

```text
components/ui/
  form.tsx             generic Form, createForm, compound-field foundation
  input-field.tsx
  select-field.tsx
lib/
  compose-refs.ts      composeRefs and other cross-family helpers
features/proposal/
  components/
    proposal-details.tsx
    proposal-preview.tsx
    proposal-submit.tsx
  server-state/        API call, response schema, mutation hook
  proposal-form.ts     schema, values, defaults, options, properties type, typed Form/hooks
  proposal-screen.tsx  resolver and options, properties, composition
```

Keep each cohesive public family in one file. Import component modules
directly; a barrel whose only job is re-exporting neighbors obscures
dependencies. Product form contracts and feature copy stay in the consuming
feature.
