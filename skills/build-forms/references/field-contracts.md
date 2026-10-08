# Field contracts

## Contents

- [Shared control rules](#shared-control-rules)
- [Browser hints](#browser-hints)
- [Browser behavior](#browser-behavior)
- [Input, textarea, and date](#input-textarea-and-date)
- [Select](#select)
- [Radio group](#radio-group)
- [Checkbox](#checkbox)
- [Compact adapters](#compact-adapters)

## Shared control rules

Preserve the wrapped primitive's compatible props, className, ref target,
events, disabled behavior, keyboard behavior, focus, and defaults. Call the
consumer's observational handler first, respect `event.defaultPrevented` when
the event supports it, then apply the form update. Apply internal `id`,
`name`, `value`, `checked`, `disabled`, and accessibility bindings after
consumer props. A composed React 19 ref runs callback cleanups and resets every
ref without its own cleanup to `null` on unmount; `composeRefs` lives in
`lib/compose-refs.ts`.

Restrict field paths by value type: string controls accept string-valued
paths, checkbox controls accept boolean-valued paths, and numeric or
structured values use focused semantic adapters rather than unsafe casts in a
generic string field.

## Browser hints

A generic field family never guesses field meaning. The feature sets these as
Control props where the meaning is known; the family adds no root-level prop
bags or universal defaults:

- the most accurate `type` (`email`, `tel`, `url`, `search`, `date`,
  `number`), preferred over using `inputMode` as validation;
- valid `autocomplete` tokens for user information, with stable `name` and
  `id`, a real owning form, and a submit button so browsers autofill reliably;
  never disable autocomplete or correction globally or invent tokens;
- `inputMode` only when the type cannot express the expected characters;
- `enterKeyHint` only when its label matches what Enter actually does;
- `autoCapitalize`, `spellCheck`, and autocorrection from the content: names
  and prose differ from usernames, codes, URLs, and identifiers;
- native `required`, `minLength`, `maxLength`, `min`, `max`, `step`, and
  `pattern` mirroring schema constraints only when their semantics truly
  match; the server still validates. Native constraints that block submission
  (`required`, `pattern`, `min`, `max`, `step`, `minLength`) need a root with
  `noValidate`, or browser bubbles replace the schema's messages. Without it,
  use `aria-required` for required state, keep the schema as the only
  validator, and report "add `noValidate` to the shared root". `maxLength`
  only limits typing and is safe either way.

Prefer a native input or select when its picker, autofill, or mobile behavior
is central to the task. For a custom Select or combobox, verify that the
primitive's hidden form control supports the required `name`, required state,
and autofill instead of assuming native parity.

## Browser behavior

- Render a real `<form>` and a real submit button so Enter submission,
  autofill, password managers, and form ownership work; use the Button
  primitive when it keeps native `<button>` semantics.
- Give every non-submit button inside a form `type="button"`.
- Keep labels visible; placeholders are examples, not labels. Do not block
  paste or password managers.
- Use `readOnly` when a value must stay focusable and submitted; a disabled
  native control is neither focusable nor submitted.
- Avoid automatic focus unless the task clearly benefits; keep visible
  `:focus-visible` styling and practical touch targets.
- Set `aria-busy` only on a region actively being updated whose announcements
  should wait, not merely because a request is pending.

## Input, textarea, and date

Expose `Root`, `Label`, `Control`, `Description`, and `Error`. The Control
takes native Input or Textarea props directly; when `required` is passed it
keeps the native attribute and derives `aria-required`, which assumes the
root sets `noValidate` (see [Browser hints](#browser-hints)).

Implement Date as a semantic composition of the Input family when the native
date input is the repository convention. Normalize its value at the Control
boundary and verify the form library receives browser date changes.

## Select

Expose `Root`, `Label`, `Control`, `Trigger`, `Value`, `Content`, `Item`,
`Description`, and `Error`.

- Root binds the field and outer Field layout.
- Control owns the Select primitive root, value, disabled state, name,
  value-change composition, and native `required`.
- Trigger owns trigger props and the field control ID and ARIA, reflects the
  Control's required state with `aria-required` without a repeated consumer
  prop, and composes the form-library ref and blur binding so error focus,
  touched state, and on-blur validation reach the interactive element.
- Content owns portal, positioning, collision, and content props.
- Item owns item value, disabled state, text, and item props.

## Radio group

Expose `Root`, `Legend`, `Description`, `Control`, `Option`, `Item`, option
content/title/description slots, and `Error`.

The Option boundary owns one stable item value and generated ID; nested Item
and option presentation read that identity, so consumers do not repeat IDs.
Control owns RadioGroup props and the form value binding. Consumers `.map()`
options when the root receives no options collection; if the root owns the
collection, add a render-callback collection boundary instead.

## Checkbox

Expose `Root`, `Label`, `Layout`, `Control`, `Content`, `Title`,
`Description`, and `Error`. Keep Layout explicit so it receives Field props
naturally; do not hide it inside Label or add `layoutProps` to the root.

Translate the primitive's checked state to the form's boolean contract at the
Control boundary. Support indeterminate presentation only when the schema and
product model deliberately do.

## Compact adapters

Every family exports one compact adapter, the default for feature code. All
take `control`, `name`, `label`, optional `description`, the controller's
`disabled` and `shouldUnregister`, and `slotProps` with `field`,
`fieldLabel`, `fieldDescription`, and `fieldError`:

| Adapter | Main control props | Data props | Extra `slotProps` keys |
| --- | --- | --- | --- |
| `InputField`, `TextareaField` | Input or Textarea props, spread | none | none |
| `SelectField` | none; `required` is top-level | `options`, `placeholder` | `select`, `selectTrigger`, `selectValue`, `selectContent`, `selectItem` |
| `RadioGroupField` | none; `required` is top-level | `options` | `radioGroup`, `radioGroupItem` |
| `CheckboxField`, `SwitchField` | Checkbox or Switch props, spread | none | none |

Type `options` from the field value so each option's `value` matches the
schema. An option needing its own description or layout is custom anatomy:
compose the family's slots. The adapter renders the same slots, so IDs, ARIA,
and bindings behave identically in both forms.
