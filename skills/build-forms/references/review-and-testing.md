# Review and testing

## Contents

- [Audit](#audit)
- [Extension tests](#extension-tests)
- [Verification depth](#verification-depth)

## Audit

Check the form against every core contract in `SKILL.md` and the reference
that covers the touched area. These checks are easy to miss:

- Authoritative IDs, values, checked state, disabled state, and ARIA cannot be
  replaced by prop spreading.
- Consumer refs and observational handlers are composed, not overwritten;
  composed refs run callback cleanups and clear the remaining refs on unmount.
- Field paths match their value types.
- Select provider boundaries contain only Select-dependent slots; radio
  option identity is supplied once; checkbox layout is explicit.
- Compact components compose the open slots rather than duplicating behavior.
- The shared Form/provider and compound-field foundation stay together when
  they are one context/controller boundary; shared mechanics such as ref
  composition live in `lib/`, not in one field module.
- No re-export-only barrel obscures dependencies or introduces circular
  imports.
- React context carries only the stable Zustand `StoreApi`, not a raw mutable
  properties object; changing one property rerenders only selectors whose
  result changed, and the root prop and selector hooks keep the declared
  feature type.
- Two mounted forms have isolated values, unique IDs, and isolated properties
  stores.
- Form actions reuse the repository's Button primitive with an explicit
  submit or non-submit `type`.

## Extension tests

For each relevant family:

1. Omit Description and Error and inspect `aria-describedby` and
   `aria-errormessage`.
2. Reorder Label, Control, Description, and Error where semantics permit.
3. Insert a consumer-owned layout wrapper or separator.
4. Pass a primitive-specific prop and a consumer ref to each slot.
5. Render two roots with the same field name in separate forms.
6. Trigger validation, focus the invalid control, correct it, reset, and
   submit.
7. Exercise required state, autofill, mobile keyboard hints, Enter submission,
   and non-submit buttons in the form's supported environments.

For Select, open by pointer and keyboard, select an item, inspect portal
content, verify focus return and invalid styling, trigger blur validation, and
focus the trigger after an invalid submit. For Radio and Checkbox, verify
accessible names and checked state. For field arrays, add, remove, and reorder
without value drift. For multi-step forms, test forward validation, backward
state retention, first-invalid-step routing, and final success and failure.
Inspect the accessibility tree: every ID reference resolves and no valid field
exposes an error.

## Verification depth

Run typecheck and lint for public API safety. Use existing interaction tests or
a browser pass for focus, keyboard, portals, ARIA, dynamic fields, and workflow
transitions. Run the production build for framework and client/server
boundaries. Do not introduce a new test framework only for one form change.
