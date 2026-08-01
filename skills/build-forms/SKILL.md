---
name: build-forms
description: Design, implement, refactor, or audit composable and accessible React form systems that adapt to repository-native shadcn or Radix primitives, form libraries, schema validators, and feature structure. Use for reusable compound field families, React Hook Form controllers, Zod validation, input/select/textarea/radio/checkbox/date adapters, dynamic field arrays, conditional fields, multi-step forms, submission workflows, error focus, and separating form state from steppers or other navigation.
---

# Build Forms

Build form APIs whose bindings and accessibility live once while every visible
part remains independently composable.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Required workflow

1. Read repository instructions and inspect React, form-library, validator,
   shadcn or Radix, styling, compiler, feature-placement, and test conventions.
2. Trace existing fields, schemas, submit handlers, server-state hooks, dynamic
   collections, workflow navigation, and consumers before changing structure.
3. Classify the task as `create`, `extend`, `refactor`, or `audit`.
4. Write a short form model:
   - form state and schema owner;
   - field root responsibilities;
   - control, label, description, error, content, and item slots;
   - conditional and repeated-field ownership;
   - workflow/navigation owner;
   - submission and remote-state owner.
5. Audit each wrapped primitive's props, ref, events, value contract, disabled
   behavior, ARIA, focus, keyboard behavior, defaults, and portal boundaries.
6. Implement a shared field foundation, then compose control-specific families
   from it. Keep each cohesive family discoverable from one module.
7. Exercise omission, reordering, custom layout, conditional slots, two form
   instances, validation failure, reset, submission success/failure, dynamic
   add/remove/reorder, and every workflow transition relevant to the task.
8. Run repository formatting, lint, typecheck, interaction tests, and build in
   proportion to risk. Report preserved contracts and unresolved assumptions.

## Core contracts

- Keep form state separate from workflow navigation. A Stepper owns step value,
  ordering, and navigation. A Form owns values, validation, and submission. A
  feature adapter may validate the active step and then call `stepper.next()`.
- Put registration, generated IDs, invalid/disabled state, and accessibility
  relationships on the field root or shared field foundation.
- Give every public part the compatible props of the primitive it renders.
  Expose `SelectFieldTrigger`, `SelectFieldContent`, and similar slots instead
  of tunneling their contracts through `triggerProps`, `contentProps`,
  `labelProps`, or other parent prop bags.
- Preserve consumer refs by composing them with the form-library ref. Compose
  observational handlers before applying authoritative bindings.
- Keep control-specific primitive providers around only the slots that require
  them. Field label, description, and error slots stay outside a Radix Select
  provider; trigger, value, content, and items stay inside an explicit
  `SelectFieldControl` boundary.
- Include description and error IDs in `aria-describedby` only when the
  corresponding slot exists. Keep label association and error focus correct.
- Let consumers omit, reorder, wrap, and conditionally render slots. An
  optional compact field component may provide common anatomy only when it is
  implemented from the same open slots.
- Keep schema definitions, cross-field business validation, submit mutations,
  notifications, routing, and cache synchronization outside visual field slots.
- Keep a non-trivial consuming form's entry component focused on composition.
  Place schemas, inferred types, defaults and option metadata, step definitions,
  and non-visual helpers in dedicated modules inside that feature. Do not move
  product-specific artifacts into the shared `features/form` foundation.
- For a form with several descendant sections, create a feature-typed Form and
  hook once. Keep React Hook Form's `useForm` call at the feature entry, pass
  that instance to the typed Form once, and let descendants call the typed hook
  instead of receiving `UseFormReturn` props. Keep resolver and defaults out of
  the generic factory.
- Use stable field-array identity from the form library. Never use array index
  as the React key or repeat positional identity through nested field parts.
- Keep conditional values deliberately: unregister only when product semantics
  say a hidden field must be removed from the submitted model.
- Reuse repository-native `Field`, `Label`, `Input`, `Select`, `Textarea`,
  `RadioGroup`, `Checkbox`, and error primitives rather than restyling raw DOM.

## Companion skill routing

Inspect the installed skill catalog before implementation when the request
crosses the form boundary.

- For general compound-family or primitive-extension architecture, use
  `$build-composable-components` when available.
- For API contracts, TanStack Query, submit mutations, cache synchronization,
  optimistic updates, or authenticated requests, use `$manage-server-state`
  when available.
- If a useful companion is not installed, explain its concrete benefit once
  and ask whether the user wants it installed. Example: “This form submits to
  an API and updates cached records. `$manage-server-state` handles the API
  contract, mutation, cache synchronization, and rollback. Do you want me to
  install it?”
- Install only after approval and only through the environment's supported
  skill installer. If no installer is available, offer the direct command:
  `npx shadcn@latest add barehera/react-skills/manage-server-state`.
- Continue with this skill if the user declines. Do not make a companion skill
  a hidden prerequisite or repeatedly recommend it.

## Read focused guidance

- Read [architecture.md](references/architecture.md) before defining the field
  foundation, public slots, file boundaries, or placement.
- Read [field-contracts.md](references/field-contracts.md) when implementing or
  reviewing input, textarea, select, radio, checkbox, or date families.
- Read [workflows-and-submission.md](references/workflows-and-submission.md) for
  multi-step forms, field arrays, conditional fields, submission, and companion
  skill routing.
- Read [review-and-testing.md](references/review-and-testing.md) for audits,
  refactors, accessibility review, extension tests, and final verification.
- Read [examples.md](references/examples.md) before creating a new form
  foundation or typed feature form, and adapt the bundled implementation rather
  than copying its domain model or paths blindly.

## Decision defaults

Use these only when the repository has no established convention:

- Feature-scoped shared form infrastructure under `features/form`, with
  `components`, `logic`, and `constants` separated by responsibility.
- For a non-trivial consuming form, sibling `components`, `schemas`, `types`,
  `constants`, and `logic` boundaries inside its feature. Collapse them only
  when the form is genuinely small and the separation would add no clarity.
- React Hook Form as the state/controller boundary and Zod as the schema source
  only when already installed or explicitly requested.
- One shared compound-field context for stable IDs and controller bindings;
  control-specific contexts only for item identity such as radio options.
- Compound families as the primary API and compact fields as optional secondary
  compositions.
- Direct imports instead of a new barrel unless the repository already exposes
  stable feature barrels.

Do not force React Hook Form, Zod, a feature folder, multi-step navigation, or
compound components onto a simpler coherent repository.
