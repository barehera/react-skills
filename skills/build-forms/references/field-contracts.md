# Field contracts

## Contents

- [Shared control rules](#shared-control-rules)
- [Input, textarea, and date](#input-textarea-and-date)
- [Select](#select)
- [Radio group](#radio-group)
- [Checkbox](#checkbox)
- [Convenience compositions](#convenience-compositions)

## Shared control rules

Preserve the wrapped primitive's compatible props, className, ref target,
events, disabled behavior, keyboard behavior, focus, and defaults.

Compose the consumer ref with the form-library ref. Compose observational
handlers first, respect `event.defaultPrevented` when the event supports it,
then apply the authoritative form update. Apply internal `id`, `name`, `value`,
`checked`, `disabled`, and accessibility bindings after consumer props.
Keep cross-family mechanics such as `composeRefs` under the shared form
feature's `utils` surface, not embedded in one control-family module.

Restrict field paths by value type when the form library supports it:

- string controls accept string-valued paths;
- checkbox controls accept boolean-valued paths;
- numeric or structured values use focused semantic adapters rather than
  unsafe casts in a generic string field.

## Input, textarea, and date

Expose `Root`, `Label`, `Control`, `Description`, and `Error`. The Control owns
native Input or Textarea props directly. Preserve autocomplete, input mode,
placeholder, type, constraints, and consumer events.

Implement Date as a semantic composition of the Input family when the native
date input is the repository convention. Normalize its value at the control
boundary and verify the form library receives browser date changes.

## Select

Expose `Root`, `Label`, `Control`, `Trigger`, `Value`, `Content`, `Item`,
`Description`, and `Error`.

- Root binds the field and outer Field layout.
- Control owns the Select primitive root, value, disabled state, name, and
  value-change composition.
- Trigger owns trigger props and the field control ID/ARIA.
- Content owns portal, positioning, collision, and content props.
- Item owns item value, disabled state, text, and item props.

Do not wrap Label, Description, or Error in the Select primitive provider.
Verify mouse and keyboard opening, item selection, portal rendering, focus
return, and invalid styling.

## Radio group

Expose `Root`, `Legend`, `Description`, `Control`, `Option`, `Item`, option
content/title/description slots, and `Error`.

The Option boundary owns one stable item value and generated ID. Nested Item
and option presentation read that identity; consumers do not repeat IDs.
Control owns RadioGroup props and form value binding. Use consumer `.map()` for
options when the root does not receive an options collection. If the root owns
the collection, add a render-callback collection boundary instead.

## Checkbox

Expose `Root`, `Label`, `Layout`, `Control`, `Content`, `Title`, `Description`,
and `Error`. Keep Layout explicit so it receives Field props naturally; do not
hide it inside Label or add `layoutProps` to the root.

Translate the primitive's checked state to the form's boolean contract at the
Control boundary. Preserve indeterminate presentation only when the schema and
product model support it deliberately.

## Convenience compositions

Convenience fields are appropriate for repeated default anatomy. Keep their API
small and predictable. When customization requires `triggerProps`,
`contentProps`, `fieldProps`, `labelProps`, or similar bags, direct the consumer
to the compound slots instead of growing the convenience component.
