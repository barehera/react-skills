# Review and testing

## Review checklist

- Form, Stepper, and surrounding Card/Dialog/Sheet primitives have separate
  owners; no `StepperForm`, `CardForm`, `DialogForm`, or similar fused API
  combines their state or prop contracts.
- Root/controller bindings are supplied once.
- Every slot receives its own compatible primitive props directly.
- No root-level `triggerProps`, `contentProps`, `labelProps`, `fieldProps`, or
  similar bags proxy independently configurable children.
- Compact components compose the open slots rather than duplicating behavior.
- Consumer refs and observational handlers are composed, not overwritten;
  composed refs run callback cleanups and clear remaining refs on unmount.
- Authoritative IDs, values, checked state, disabled state, and ARIA cannot be
  accidentally replaced by prop spreading.
- Description and error ID references exist only when their slots render.
- `aria-errormessage` exists only while invalid and points to the visible error;
  required controls expose native or equivalent required semantics once.
- Semantic type, autocomplete, mobile keyboard, capitalization, spellcheck,
  and constraint props remain available on the natural Control slot and are
  selected from field meaning rather than generic defaults.
- Select provider boundaries contain only Select-dependent slots.
- Radio option identity is supplied once.
- Checkbox layout is explicit and configurable.
- Field paths match their value types.
- Dynamic arrays use stable React keys and survive add/remove/reorder.
- Conditional fields retain or unregister values deliberately.
- Schema, product policy, submission, API, cache, routing, and notifications
  stay outside visual field slots.
- A consuming feature keeps a cohesive schema, inferred values, defaults,
  options, and typed Form/hook together unless one artifact has earned an
  independent module.
- Product-specific contracts remain in the consuming feature rather than
  leaking into shared `features/form` code or unnecessary one-file folders.
- Shared mechanics such as ref composition live outside individual Input or
  Select field modules and are implemented directly in `utils/index.ts`.
- The shared Form/provider and compound-field foundation stay together when
  they represent one reusable context/controller boundary.
- Component modules are imported directly; no re-export-only barrel obscures
  dependencies or introduces circular imports.
- Descendant sections obtain the typed form through a feature hook instead of
  receiving the same `UseFormReturn` prop repeatedly.
- The typed form factory binds provider and hook types only; the feature entry
  still owns `useForm`, resolver selection, defaults, and submission policy.
- Two mounted forms have isolated values and unique IDs.

## Extension tests

For each relevant family:

1. Omit Description and Error and inspect `aria-describedby` and
   `aria-errormessage`.
2. Reorder Label, Control, Description, and Error where semantics permit.
3. Insert a consumer-owned layout wrapper or separator.
4. Pass a primitive-specific prop and consumer ref to each slot.
5. Render two roots with the same field name in separate forms.
6. Trigger validation, focus the invalid control, correct it, reset, and submit.
7. Exercise required state, browser autofill, mobile keyboard hints, Enter
   submission, and non-submit buttons for the form's supported environments.

For Select, open by pointer and keyboard, select an item, inspect portal content,
verify focus return, trigger blur validation, and focus the trigger after an
invalid submit. For Radio and Checkbox, verify accessible names and checked
state. For field arrays, add, remove, and reorder without value drift.
For multi-step forms, test forward validation, backward state retention, first
invalid-step routing, and final success/failure.

## Verification depth

Run typecheck and lint for public API safety. Use existing interaction tests or
a browser pass for focus, keyboard, portals, ARIA, dynamic fields, and workflow
transitions. Run the production build for framework and client/server
boundaries. Do not introduce a new test framework only for one form change.
