# Form architecture

How to implement the field-family and feature-form contracts in `SKILL.md`.

## Contents

- [Incumbent form layers](#incumbent-form-layers)
- [Shared field foundation](#shared-field-foundation)
- [Compact adapters and slot props](#compact-adapters-and-slot-props)
- [Accessibility relationships](#accessibility-relationships)
- [Typed feature form](#typed-feature-form)
- [Form-wide properties](#form-wide-properties)
- [Placement](#placement)

## Incumbent form layers

An incumbent form layer is the factory plus adapters a repository already
has. Map the skill's vocabulary onto it instead of introducing a second one:

| Skill term | Typical incumbent shapes |
| --- | --- |
| `createForm` returning `Form`, `useForm`, `useProperties` | `createFormWrapper` returning `{ FormWrapper, useFormWrapper }` |
| `properties` store and selector hook | a `context` object read through the typed hook |
| compact adapter (`InputField`, `SelectField`) | `TextField`, `SwitchField`, `SelectField` taking a shared `FormFieldProps` |

Build the new form with the incumbent's names, imports, and prop style. When
it lacks an adapter, add one beside the others in the same style. Gaps
against the core contracts, such as a schema typed `ZodType<T, T>` that
forbids transforms, a root without `noValidate`, or an unconditional
`aria-describedby`, are reported findings; fix them only when the task owns
the shared module.

## Shared field foundation

The form root provides form context and submission. A field root binds one
field and provides IDs, invalid state, disabled state, ref, value, and events
through one shared context; leaf slots render repository primitives. Keep
control-specific value conversion and primitive providers inside the control
family rather than expanding the shared root into a switchboard.

## Compact adapters and slot props

Feature code renders one compact adapter per field:

```tsx
<SelectField
  control={form.control}
  name="plan"
  label="Plan"
  description="Billing starts today."
  options={PLAN_OPTIONS}
  placeholder="Choose a plan"
  slotProps={{ selectTrigger: { className: "font-mono" } }}
/>
```

The adapter contract:

- `control`, `name`, `label`, and an optional `description` are top-level.
- Data for the control's contents, such as `options` and `placeholder`, is
  top-level and typed from the field value, so an option outside the schema's
  enum fails to compile.
- Remaining primitive props go to the main control (`...inputProps` for an
  Input); a control whose main element is not obvious, such as Select, puts
  every primitive part in `slotProps`.
- `slotProps` is one object keyed by primitive part: `field`, `fieldLabel`,
  `fieldDescription`, `fieldError`, and control parts such as `select`,
  `selectTrigger`, `selectValue`, `selectContent`, and `selectItem`.
- Each slot type is the compound slot's props minus what the adapter owns:
  IDs, `name`, `value`, `onValueChange`, refs, `aria-*` relationships, and
  `children`. The adapter spreads slot props first and applies authoritative
  bindings after them.
- The adapter renders the open compound slots from the same module, through a
  shared anatomy component such as `CompactField`, so bindings and ARIA exist
  once.

Compose the compound slots directly when the anatomy changes: a counter in
the label row, a label inside a checkbox card, an error rendered elsewhere, or
an inline adornment. Never grow the adapter with layout booleans or ad hoc
bags such as `triggerProps`; a new part becomes a `slotProps` key only when it
is a real primitive part of every instance.

Each compound part owns the props of what it renders:

- Root: controller props and outer Field or FieldSet props.
- Label: Label or Legend props.
- Control: Input, Textarea, Checkbox, RadioGroup, or primitive-root props.
- Trigger, value, content, item: the corresponding Select primitive props.
- Description: FieldDescription props.
- Error: FieldError presentation props; internal errors remain authoritative.
- Layout/content: Field and FieldContent props.

```tsx
<InputFieldRoot control={form.control} name="title">
  <div className="flex items-baseline justify-between gap-2">
    <InputFieldLabel>Title</InputFieldLabel>
    <TitleLength />
  </div>
  <InputFieldControl maxLength={80} />
  <InputFieldError />
</InputFieldRoot>
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

Descendants call `useProposalForm()` and pass `form.control` to each adapter
or field root, which keeps typed field-path inference without receiving the
whole form as a prop. A descendant that needs reset, step validation, server errors, or
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
server-state layer own them. A section that needs query-backed options calls
the query hook itself. The name `properties` avoids a collision with React
Hook Form's resolver `context` option.

Both mechanisms satisfy the same contract: descendants read non-field state
from the root, never from section props. Use the store for values that change
often while the form is mounted. An incumbent's plain context value is
acceptable for rarely changing values such as pending state, edit mode, or
static options; do not replace it with a store.

## Placement

Follow the repository first. From scratch:

```text
components/ui/
  form.tsx             generic Form, createForm, compound-field foundation, CompactField
  input-field.tsx      InputField adapter and InputField* slots
  select-field.tsx     SelectField adapter and SelectField* slots
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
