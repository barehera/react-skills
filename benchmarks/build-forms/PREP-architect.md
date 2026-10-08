# build-forms benchmark suite: architect report

Suite: `benchmarks/build-forms/suite.json` (`fixture: "fixture"`, transfer task
`t4-workspace-wizard`). Rubric version 1 on every task. Nothing under
`variants/` or `results/` was read.

## What the skill uniquely teaches (basis for the criteria)

- A shared field foundation (`features/form`): one compound field root that
  owns `useController`, `useId`, and invalid, disabled and ARIA wiring. Control
  families (Input, Textarea, Select, Checkbox) are composed from it.
- Open slots per family (Root, Label, Control, Description, Error; Select also
  has Control, Trigger, Value, Content and Item). No `labelProps`,
  `inputProps`, `triggerProps` or similar prop bags.
- ARIA: `aria-describedby` and `aria-errormessage` reference only rendered,
  visible parts; `aria-invalid` only while invalid; native `required`; the
  Select trigger gets the id, ref and blur.
- A cohesive `<feature>-form.ts` (schema, inferred type, defaults, options,
  typed Form root and hook from `createForm`). `useForm` runs once, and
  descendants use the typed hook instead of `UseFormReturn` props.
- Primitive contract: compose refs (`composeRefs` in `utils/index.ts`),
  compose handlers, apply authoritative bindings last.
- Field arrays keyed by `field.id`. Conditional fields are deliberately
  unregistered or retained.
- Form, Stepper, Dialog and Card stay independent (no `StepperForm` or
  `DialogForm`). Step-scoped `trigger(fields, { shouldFocus })` before
  `stepper.next()`.
- Submission goes through the feature mutation at the screen. Server field
  errors are mapped with `setError`. Values survive failure. Non-submit
  buttons get `type="button"`.
- Semantic browser hints (`type`, `autocomplete`, `autoCapitalize`,
  `spellCheck`, `enterKeyHint`) are chosen at the feature, never as defaults
  in the generic Input.

## Tasks

### t1-new-task-form (create): build a form system from scratch

The `NewTaskPage` placeholder becomes a form with Title, Description and
Status, a live preview, a footer submit, a 409 error on Title, and a
form-level error that keeps values. The field blocks must be reusable.

Overlay:
- shadcn `label`, `separator`, `field`, `input`, `textarea` and `select`
- `use-create-task-mutation.ts` (throws `ApiError`; 409 means the title is
  taken)
- the placeholder `new-task-page.tsx`

| criterion | w |
|---|---|
| field-foundation | 3 |
| open-slots | 3 |
| aria-wiring | 2 |
| typed-feature-form | 3 |
| server-errors | 2 |
| submission-boundary | 2 |
| primitive-contract | 2 |
| select-boundary | 1 |
| conventions | 1 |
| wired-and-typed | 2 |

### t2-task-checklist (extend): add to an existing form

This adds two things to `EditTaskScreen`:
- a checklist field array (add, tick, edit, remove, move up and down; at most
  20; no empty items)
- a "Repeats" checkbox that reveals a required "Repeat every" select

`repeatEvery` must be left out of the request when the task does not repeat.

Overlay:
- the skill's foundation, adapted to the fixture (`features/form/components/{form,input-field,select-field}.tsx`, `features/form/utils/index.ts`)
- the existing `task-form.ts`, `task-details-fields.tsx`, `task-form-actions.tsx` and `edit-task-screen.tsx`
- `use-update-task-mutation.ts`
- an extended `types.ts` (adds `checklist` and `repeatEvery`)
- the shadcn primitives, plus `checkbox.tsx`

The prompt does not say to use `features/form`, so finding and reusing it is
part of the test.

| criterion | w |
|---|---|
| reuse-foundation | 3 |
| checkbox-contract | 2 |
| field-array-identity | 3 |
| array-controls | 2 |
| conditional-value | 3 |
| cohesive-feature-form | 2 |
| scope-discipline | 1 |
| wired-and-typed | 2 |

### t3-invite-audit (audit, seeded, no edits)

The agent reviews a messy invite-members dialog, a generic
`src/components/form-field.tsx` and a fused `src/components/dialog-form.tsx`,
using `docs/backlog.md` as context.

Seeded defects:
- **MEM-5:** a second `useForm` in `InviteSummary`, plus `form` prop drilling.
- **MEM-2:** `key={index}` in the field array.
- **MEM-3:** the "Add another" button has no `type`.
- **MEM-6:** the `inputProps` spread after `register` replaces `onBlur`.
- The members policy (`isPersonalEmail`) is imported inside the shared field.
- The shared field takes `labelProps`/`inputProps` prop bags.
- **MEM-9:** `aria-describedby` points at missing ids, there is no
  `aria-invalid`, and ids derived from `name` collide across two forms.
- Hard-coded `autoComplete="off"` (breaks SET-6) and email inputs without
  `type="email"`.
- The fused `DialogForm` component.
- A duplicate-email check done with `window.alert` instead of a schema rule.
- One-file `schemas/` and `types/` folders.

Keep-traps:
- **MEM-8:** `shouldUnregister: true` on the personal note is how the legal
  item is met.
- `role="alert"` on the submit error banner is correct.

| criterion | w |
|---|---|
| no-edits | 2 |
| form-instance | 3 |
| index-keys | 2 |
| button-type | 2 |
| handler-override | 2 |
| policy-in-shared-field | 3 |
| slots-not-bags | 2 |
| aria-and-ids | 2 |
| semantic-hints | 1 |
| fused-dialog-form | 2 |
| schema-owned-rules | 1 |
| cohesive-form-module | 1 |
| keep-unregister-note | 3 |
| keep-submit-alert | 1 |
| report-quality | 2 |

### t4-workspace-wizard (create, TRANSFER)

A three-step "Create workspace" wizard runs inside a Dialog using an existing
generic Stepper:
- Continue validates only the current step; Back keeps values.
- A 409 sends the user back to the Workspace step with the error on the URL
  field.
- "Most people fill this in on their phones" tests the semantic hints.

None of the skill's examples cover multi-step forms, dialogs or mobile hints.

Overlay:
- the same foundation as t2
- shadcn `dialog.tsx`
- a generic `components/ui/stepper.tsx` (`Stepper`, `StepperList`/`Item`/`Indicator`/`Title`/`Content`, `useStepper`; content unmounts when inactive)
- `use-create-workspace-mutation.ts` (nested `owner`/`workspace` input)
- the placeholder `create-workspace-dialog.tsx`

| criterion | w |
|---|---|
| independent-owners | 3 |
| step-validation | 3 |
| value-retention | 2 |
| error-routing | 2 |
| semantic-hints | 2 |
| typed-feature-form | 2 |
| reuse-foundation | 2 |
| wired-and-typed | 2 |

## Packages and fixture

The shared fixture has no form packages. Add them to
`benchmarks/fixture/package.json` and run `npm install` before any run:

- `react-hook-form` ^7.84.0
- `zod` ^4.4.3
- `@hookform/resolvers` ^5.5.7

These are the versions already in the repo root `node_modules`. No separate
fixture is needed: the app is still Vite + React 19. The form primitives
(`label`, `separator`, `field`, `input`, `textarea`, `select`, `checkbox`,
`dialog`, `stepper`) are in each task's overlay, so the shared fixture is not
modified.

## Verification

Method:
1. Copy the fixture without `node_modules`, then the overlay, into scratch.
2. Point `node_modules` at a junction folder that holds the fixture's
   packages plus `react-hook-form`, `zod` and `@hookform` from the repo root.
3. Run `tsc --noEmit -p .`.

Results:
- t1, t2, t3 and t4 overlays: typecheck exit 0.
- t2 also passed with `preserveSymlinks`.
- Sanity check: an invalid field name in t2 gave `TS2322`, so the RHF types
  really resolve.
- t4 feasibility: a throwaway solution sketch also typechecked (nested
  `createForm` schema, `trigger([...], { shouldFocus })`, `useStepper`,
  `Dialog`, and `InputField` on `owner.email`).
- The scratch folder was deleted. Junctions were removed as links first, and
  the fixture `node_modules` is intact.

Status: verified with the packages. Repeat after the packages are installed
in the fixture itself ("verify after install"), because the real run links
`fixture/node_modules`.

## Open questions

1. The suite needs the three packages in the shared fixture. Confirm that
   changing the shared fixture's `package.json` is OK for the other suites,
   or approve a `fixture-build-forms` copy with its own install.
2. The form primitives are repeated in each overlay. They could go into the
   shared fixture instead, but that changes the starting app for other
   suites.
3. Task size: t1 (a foundation with three families plus a feature form) is
   the largest. Expect more than 5 minutes for a `none` variant. If it is too
   slow, drop the Description textarea.
4. t2 and t4 ship the skill's own foundation code as existing repository
   code. That is intended (an extend or transfer on a repository that already
   follows the pattern), but it narrows the gap between `none` and the skill
   on reuse criteria.
5. The criteria accept `src/features/form` (the skill default) or another
   single shared form module. The owner's "generic components in
   components/ui" preference conflicts with the skill's `features/form`
   default. Decide whether location should be graded strictly.
