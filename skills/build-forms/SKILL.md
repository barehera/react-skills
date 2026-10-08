---
name: build-forms
description: Design, implement, refactor, or audit composable, accessible, and browser-friendly React form systems that adapt to repository-native shadcn or Radix primitives, form libraries, schema validators, and feature structure. Use for reusable compound field families, React Hook Form controllers, Zod validation, input/select/textarea/radio/checkbox/date adapters, autofill and mobile input UX, dynamic field arrays, conditional fields, multi-step forms, submission workflows, error focus, and separating form state from steppers or other navigation.
---

# Build Forms

Build form APIs whose bindings and accessibility live once while every visible
part remains independently composable.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, typed forms, queries,
mutations, product rules). Dependencies point downward only.

This skill owns the field-family layer under `components/ui` and the typed
feature form in the adapter. Field families never import a feature schema,
mutation, or product rule; the feature's `<feature>-form.ts` and screen own
those and connect them to server state through `$manage-server-state`.

## Required workflow

1. Read repository instructions and inspect the form library, validator,
   shadcn or Radix primitives, styling, feature placement, and tests. Trace
   existing fields, schemas, submit handlers, server-state hooks, dynamic
   collections, workflow navigation, and consumers before changing structure.
   Classify the task as `create`, `extend`, `refactor`, or `audit`.
2. Write a short form model: the form state and schema owner; the field root's
   responsibilities; the control, label, description, error, content, and item
   slots; and the owners of conditional and repeated fields, workflow
   navigation, any surrounding Card, Dialog, or Sheet, and submission and
   remote state.
3. Audit each wrapped primitive's props, ref, events, value contract, disabled
   behavior, ARIA, focus, keyboard behavior, semantic input type,
   autocomplete, mobile hints, constraints, defaults, and portal boundaries.
4. Implement a shared field foundation, then compose control-specific families
   from it. Keep each cohesive family discoverable from one module.
5. Run the [extension tests](references/review-and-testing.md#extension-tests)
   the task touches: omission, reordering, custom layout, two form instances,
   validation failure, reset, submit success and failure, dynamic
   add/remove/reorder, and workflow transitions.
6. Run the repository's format, lint, typecheck, interaction tests, and build
   in proportion to risk. Report preserved contracts and unresolved
   assumptions.

## Core contracts

Ownership:

- A Form owns values, validation, and submission; a Stepper owns step value,
  order, and navigation. A feature adapter may validate the active step and
  then call `stepper.next()`.
- Keep independently responsible components independent even when one renders
  around another. Never create fused `StepperForm`, `FormStepper`, `CardForm`,
  `DialogForm`, or similar APIs. Render the separate Stepper, Form, Card,
  Dialog, or Sheet components in the feature composition; each retains its own
  state, props, context, and behavior.
- Schema definitions, cross-field business validation, submit mutations,
  notifications, routing, and cache synchronization stay outside visual field
  slots.

Field families:

- Registration, generated IDs, invalid/disabled state, and accessibility
  relationships live once on the field root or shared field foundation.
- Every public part takes the compatible props of the primitive it renders.
  Expose `SelectFieldTrigger`, `SelectFieldContent`, and similar slots instead
  of tunneling their contracts through `triggerProps`, `contentProps`,
  `labelProps`, or other parent prop bags.
- Consumers omit, reorder, wrap, and conditionally render slots. An optional
  compact field may provide common anatomy only when it is implemented from
  the same open slots.
- Compose consumer refs with the form-library ref, and observational handlers
  before authoritative bindings. Helpers shared by several field families live
  outside any one Input or Select module.
- Keep control-specific primitive providers around only the slots that require
  them. Field label, description, and error slots stay outside a Radix Select
  provider; trigger, value, content, and items stay inside an explicit
  `SelectFieldControl` boundary.
- `aria-describedby` lists the description ID only when that slot renders and
  the error ID only while invalid with an error slot rendered;
  `aria-errormessage` points to that visible error slot only while invalid.
- Preserve native `required` and reflect required state on custom interactive
  controls. Semantic `type`, valid `autocomplete`, `inputMode`,
  `enterKeyHint`, capitalization, spellcheck, and native constraints stay
  Control-slot props chosen per field; never guess one universal value for
  unrelated fields.
- Field-array React keys use the form library's stable field identity, never
  the array index, and nested field parts do not repeat positional identity.
- Unregister a conditional field only when product semantics say the hidden
  value must leave the submitted model.
- Reuse repository-native `Field`, `Label`, `Input`, `Select`, `Textarea`,
  `RadioGroup`, `Checkbox`, `Button`, and error primitives rather than
  restyling raw DOM controls. Keep semantic `form`, `fieldset`, `section`, and
  headings where no UI primitive replaces them.

Feature form:

- Co-locate a consuming feature's schema, inferred values, defaults, option
  metadata, and typed Form/hook in one `<feature>-form.ts`. Split an artifact
  out only when it becomes independently reusable or the module stops being
  cohesive. Product artifacts stay out of the shared `components/ui`
  foundation.
- For a form with several descendant sections, create a feature-typed Form and
  hook once. The typed Form root calls React Hook Form's `useForm` exactly once
  and takes `resolver`, `defaultValues`, `mode`, and other `UseFormProps`
  directly; descendants call the typed hook instead of creating another form
  instance or receiving `UseFormReturn` props. The factory stays generic: the
  consuming feature chooses those options.
- When several descendants need external, non-field properties, bind an
  optional second properties type in `createForm` and pass one `properties`
  object to the root. The root creates one scoped vanilla Zustand store per
  mount and exposes a typed selector hook; its provider carries only the
  stable `StoreApi`. Values stay in React Hook Form. Never use a module-global
  store or the removed `zustand/context` API, and keep React Hook Form's
  resolver `context` option separate from these properties.

## Companion skill routing

When the request crosses the form boundary, check the installed catalog:

- `$use-preferred-react-stack`: library selection and verified defaults;
  preserve the consuming project's coherent incumbent stack.
- `$extract-named-helpers`: helper extraction and signatures. Form bindings
  and shared field infrastructure stay here.
- `$build-composable-components`: general compound-family or
  primitive-extension architecture, including a primitive's typed `size` or
  `variant`.
- `$manage-server-state`: API contracts, TanStack Query, submit mutations,
  cache synchronization, optimistic updates, and authenticated requests.

If a useful companion is missing, explain its concrete benefit once and ask
whether to install it. Install only after approval and only through the
environment's supported skill installer; otherwise offer
`npx --yes github:barehera/react-skills <skill>`, which installs it for the
project's saved agents. If the user declines, continue with this skill and do
not recommend it again; a companion is never a hidden prerequisite.

## References

- [architecture.md](references/architecture.md): field foundation, slot-owned
  props, accessibility relationships, typed feature form, form-wide
  properties, placement.
- [field-contracts.md](references/field-contracts.md): shared control rules,
  browser hints and behavior, and the input, select, radio, and checkbox
  families.
- [workflows-and-submission.md](references/workflows-and-submission.md):
  multi-step forms, field arrays, conditional fields, errors, submission.
- [review-and-testing.md](references/review-and-testing.md): audits,
  extension tests, verification depth.
- [examples/typed-feature-form](examples/typed-feature-form): read before
  creating a form foundation or typed feature form. A type-checked shared
  `components/ui` (generic Form and `createForm`, compound-field foundation,
  Input and Select families, `composeRefs`) and a `proposal` feature (one
  `proposal-form.ts`, sections that call `useProposalForm()`, scoped
  properties, a `server-state` mutation connected at the screen). It expects
  the app's existing shadcn Field, Input, Select, and Button primitives; do not
  reinstall or rewrite them. Adapt its paths and domain model; copy the
  layering.

## Decision defaults

Use these only when the repository has no established convention:

- Shared field families live in `components/ui`, one
  `<control>-field.tsx` per family exporting `<Control>FieldRoot`,
  `<Control>FieldLabel`, `<Control>FieldControl`, and its other parts. The
  generic Form and the shared compound-field foundation sit together in
  `components/ui/form.tsx` when they form one reusable boundary, still exported
  as separate components. Small cross-family helpers such as ref composition
  live in `lib/<name>.ts` named for what they do, such as
  `lib/compose-refs.ts`.
- A consuming feature has one `<feature>-form.ts`, a `<feature>-screen.tsx`,
  and `components/<feature>-<section>.tsx` for distinct rendered sections. Do
  not create `schemas`, `types`, `constants`, or `logic` folders merely to
  hold one form's small private artifacts.
- React Hook Form is the state/controller boundary and Zod the schema source
  for fresh choices. Check installed dependencies first and preserve an
  established incumbent in consuming projects.
- Scoped Zustand only for justified external form-wide properties; do not
  install or create a store when ordinary props suffice.
- One shared compound-field context for stable IDs and controller bindings;
  control-specific contexts only for item identity such as radio options.
- Compound families are the primary API; compact fields are optional
  secondary compositions.
- Direct component imports; no re-export-only barrels.

Do not force React Hook Form, Zod, a feature folder, multi-step navigation, or
compound components onto a simpler coherent repository.
