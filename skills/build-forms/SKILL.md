---
name: build-forms
description: Design, implement, refactor, or audit accessible, browser-friendly React form systems. Reuses the repository's incumbent typed form factory and field adapters, or builds a fresh one on shadcn or Radix primitives, React Hook Form, and Zod. Use for compact field adapters with typed slot props over compound field slots, typed feature forms, input/select/textarea/radio/checkbox/date adapters, autofill and mobile input UX, dynamic field arrays, conditional fields, multi-step forms, submission workflows, error focus, auditing forms that bypass the typed root, and separating form state from steppers or other navigation.
---

# Build Forms

Build every form on one typed form root and one adapter per control, so
bindings and accessibility live once and feature code stays declarative.

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

1. Find the incumbent form layer before anything else: a typed-form factory
   (`createForm`, `createFormWrapper`, `FormWrapper`, a custom
   `useFormContext` wrapper), field adapters (`*-field.tsx`, a shared
   `FormFieldProps` type), and their newest consumer. A shadcn `Form` that
   only re-exports `FormProvider` is a primitive, not a factory.
   - If one exists, the new form uses that factory, its hook, its non-field
     state mechanism, and its adapters in their own vocabulary. Add a missing
     adapter in the same style next to the existing ones. Never extend a
     factory that repository instructions deprecate.
   - When several styles coexist, the shared typed factory with adapters and
     tests is the incumbent; raw per-screen `useForm` code is legacy to
     migrate opportunistically, not a precedent. Ask once, naming both, only
     when two shared factories compete.
2. Read repository instructions; inspect the validator, primitives, styling,
   feature placement, and tests. Trace existing schemas, submit handlers,
   server-state hooks, dynamic collections, workflow navigation, and
   consumers. Classify the task as `create`, `extend`, `refactor`, or `audit`.
3. Write the form model as a short artifact. Its first line names the
   incumbent factory and adapters, or "none". Then: root and hook names; the
   non-field state mechanism; adapters to add; the schema owner and whether
   the root accepts distinct schema input and output types; the owners of
   conditional and repeated fields, workflow navigation, any surrounding Card,
   Dialog, or Sheet, and submission and remote state. When delegating, put the
   model verbatim in the brief; the delegate confirms it with a repository
   search before editing.
4. Audit each wrapped primitive's props, ref, events, value, disabled state,
   ARIA, focus, keyboard, input hints, constraints, defaults, and portals.
5. Build on the incumbent. With none, implement the shared foundation and its
   compound slots, then one compact adapter per control, then the feature form.
6. Run the [extension tests](references/review-and-testing.md#extension-tests) the task touches.
7. Run the repository's format, lint, typecheck, interaction tests, and build
   in proportion to risk. Report preserved contracts, unresolved assumptions,
   and [pre-existing contract violations](references/review-and-testing.md#handoff).
   End with one `Skipped:` line for what was left out on purpose and one
   `Not checked:` line for what could not be verified.

## Smallest complete change

Write only what the task needs, in the layer that owns it. Take the first
option that fully works:

1. Skip fields, options, slot props, and exports that neither the request nor
   a recorded requirement names; list them in the handoff.
2. The incumbent factory and adapters, used as workflow step 1 says.
3. The shadcn primitive with native input semantics (`type`, `autocomplete`,
   `inputMode`, `required`, constraints) before custom widgets or JavaScript.
4. React Hook Form and Zod built-ins (`useFieldArray`, the resolver, schema
   refinements) before custom state; keep values in the control's shape.
5. The minimum new code, in the field family or the typed feature form.

- Finish every place the change reaches: callers, tests, fixtures, and
  exports. Submit-time schema validation, label, description, and error
  associations, error focus, submit failure handling, and anything the user
  asked for are never cut.
- Mark a deliberate limit with one comment:
  `// shortcut: <limit>, <when to upgrade>`.

## Core contracts

These contracts describe a fresh foundation. For an incumbent one they are
the audit lens: report its gaps as findings instead of building a parallel API.

Ownership:

- A Form owns values, validation, and submission; a Stepper owns step value,
  order, and navigation. A feature adapter may validate the active step and
  then call `stepper.next()`.
- Never create fused `StepperForm`, `FormStepper`, `CardForm`, or `DialogForm`
  APIs; compose the separate components, each with its own state and props.
- Schema definitions, cross-field business validation, submit mutations,
  notifications, routing, and cache synchronization stay outside field slots.

Field families:

- The public field API is one compact adapter per control, such as
  `InputField` or `SelectField`: `control`, `name`, `label`, an optional
  `description`, data props such as `options` and `placeholder`, and the
  remaining primitive props for the main control. One typed `slotProps`
  object keyed by primitive part (`field`, `fieldLabel`, `selectTrigger`,
  `selectContent`) carries props for secondary parts.
- Each `slotProps` value is that part's props minus the bindings the adapter
  owns (`id`, `name`, `value`, `onValueChange`, `ref`, `aria-*`, `children`);
  the adapter applies authoritative bindings after the spread.
- Adapters compose open compound slots (`Root`, `Label`, `Control`,
  `Description`, `Error`, control-specific parts) exported from the same
  module. Custom anatomy, such as a label inside a checkbox card or a counter
  in the label row, composes those slots directly; they are the escape hatch.
- Registration, generated IDs, invalid/disabled state, and accessibility
  relationships live once on the field root or shared field foundation.
- Compose consumer refs and observational handlers before authoritative
  bindings ([shared control rules](references/field-contracts.md#shared-control-rules)).
- A Radix Select provider wraps only trigger, value, content, and items inside
  `SelectFieldControl`; label, description, and error stay outside it.
- `aria-describedby` lists the description ID only when that slot renders and
  the error ID only while invalid with an error slot rendered;
  `aria-errormessage` points to that visible error slot only while invalid.
- Choose [browser hints](references/field-contracts.md#browser-hints) and
  constraints per field, never one universal value. Native `required` needs a
  `noValidate` root; otherwise use `aria-required` and report the gap.
- Field-array React keys use the library's stable field identity, never the
  index, and nested parts do not repeat it. Unregister a conditional field
  only when product semantics remove its value from the submitted model.
- Reuse repository-native field, control, `Button`, and error primitives, never
  restyled raw DOM controls; keep semantic `form`, `fieldset`, `section`, and
  headings where no UI primitive replaces them.

Feature form:

- Co-locate a feature's schema, inferred values, defaults, option metadata,
  and typed Form/hook in one `<feature>-form.ts`; split an artifact out only
  when it becomes independently reusable. Product artifacts stay out of
  `components/ui`.
- For a form with several descendant sections, create a feature-typed Form and
  hook once. The typed root calls `useForm` exactly once and takes `resolver`,
  `defaultValues`, `mode`, and other `UseFormProps` directly; descendants call
  the typed hook. The factory stays generic; the feature chooses the options.
- Feature code never calls `useForm` outside the typed root, spreads a form
  instance into a provider (`<Form {...form}>`), passes `UseFormReturn`,
  submit-pending state, or read-only options through section props that the
  typed hook, root properties, or a query hook could supply, or renders an
  inline `FormField` render block for a control that has an adapter. A
  single-field inline form such as a search box is exempt.
- Before a schema `transform` or `z.coerce`, check that the root accepts
  distinct input and output types; if not, convert in a tested
  [payload mapper](references/workflows-and-submission.md#field-shaped-values).
- For non-field properties several descendants need, bind an optional second
  properties type in `createForm` and pass one `properties` object to the
  root, which creates one scoped vanilla Zustand store per mount and a typed
  selector hook. Never use a module-global store or `zustand/context`; keep
  the resolver `context` option separate. An incumbent's plain context value
  is acceptable for rarely changing values such as pending state or edit mode.

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

- [architecture.md](references/architecture.md): incumbent form layers, field
  foundation, adapters and `slotProps`, accessibility relationships, typed
  feature form, form-wide properties, placement.
- [field-contracts.md](references/field-contracts.md): shared control rules,
  browser hints and behavior, each control family and its compact adapter.
- [workflows-and-submission.md](references/workflows-and-submission.md):
  multi-step forms, field arrays, conditional fields, errors, field-shaped
  values and payload mappers, submission.
- [review-and-testing.md](references/review-and-testing.md): audits, bypass
  checks, extension tests, verification depth.
- [examples/typed-feature-form](examples/typed-feature-form): read before
  creating a foundation when the repository has none. `components/ui` holds
  `createForm`, the field foundation, and `InputField`/`SelectField` with their
  slots; the `proposal` feature uses them with one compound layout, scoped
  properties, and a mutation. Adapt paths and domain; copy the layering.

## Decision defaults

Use these only when the repository has no established convention:

- Shared field families live in `components/ui`, one `<control>-field.tsx`
  per family exporting the compact `<Control>Field` adapter and its
  `<Control>FieldRoot`, `<Control>FieldLabel`, `<Control>FieldControl`, and
  other slots. The generic Form and compound-field foundation sit together in
  `components/ui/form.tsx`. Cross-family helpers live in `lib/<name>.ts`,
  such as `lib/compose-refs.ts`.
- A consuming feature has one `<feature>-form.ts`, a `<feature>-screen.tsx`,
  and `components/<feature>-<section>.tsx` for distinct rendered sections. Do
  not create `schemas`, `types`, `constants`, or `logic` folders for one
  form's small private artifacts.
- React Hook Form is the state/controller boundary and Zod the schema source
  for fresh choices; preserve an established incumbent in consuming projects.
- Scoped Zustand only for justified external form-wide properties.
- One shared compound-field context for stable IDs and controller bindings;
  control-specific contexts only for item identity such as radio options.
- Direct component imports; no re-export-only barrels.
