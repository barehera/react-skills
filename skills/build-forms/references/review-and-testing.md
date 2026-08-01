# Review and testing

## Review checklist

- Form and workflow navigation have separate owners.
- Root/controller bindings are supplied once.
- Every slot receives its own compatible primitive props directly.
- No root-level `triggerProps`, `contentProps`, `labelProps`, `fieldProps`, or
  similar bags proxy independently configurable children.
- Compact components compose the open slots rather than duplicating behavior.
- Consumer refs and observational handlers are composed, not overwritten.
- Authoritative IDs, values, checked state, disabled state, and ARIA cannot be
  accidentally replaced by prop spreading.
- Description and error ID references exist only when their slots render.
- Select provider boundaries contain only Select-dependent slots.
- Radio option identity is supplied once.
- Checkbox layout is explicit and configurable.
- Field paths match their value types.
- Dynamic arrays use stable React keys and survive add/remove/reorder.
- Conditional fields retain or unregister values deliberately.
- Schema, product policy, submission, API, cache, routing, and notifications
  stay outside visual field slots.
- A non-trivial consuming form separates schemas, inferred types, constants,
  non-visual logic, and focused UI components instead of accumulating them in
  one entry file.
- Product-specific schemas, defaults, steps, labels, and submit logic remain in
  the consuming feature rather than leaking into shared `features/form` code.
- Two mounted forms have isolated values and unique IDs.

## Extension tests

For each relevant family:

1. Omit Description and Error and inspect `aria-describedby`.
2. Reorder Label, Control, Description, and Error where semantics permit.
3. Insert a consumer-owned layout wrapper or separator.
4. Pass a primitive-specific prop and consumer ref to each slot.
5. Render two roots with the same field name in separate forms.
6. Trigger validation, focus the invalid control, correct it, reset, and submit.

For Select, open by pointer and keyboard, select an item, inspect portal content,
and verify focus return. For Radio and Checkbox, verify accessible names and
checked state. For field arrays, add, remove, and reorder without value drift.
For multi-step forms, test forward validation, backward state retention, first
invalid-step routing, and final success/failure.

## Verification depth

Run typecheck and lint for public API safety. Use existing interaction tests or
a browser pass for focus, keyboard, portals, ARIA, dynamic fields, and workflow
transitions. Run the production build for framework and client/server
boundaries. Do not introduce a new test framework only for one form change.
