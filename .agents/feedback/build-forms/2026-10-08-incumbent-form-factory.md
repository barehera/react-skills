---
feedback_version: 1
target_skill: build-forms
target_skill_version: React Skills v3.1.1
source_project: appnation-dashboard/dashboard_frontend
captured_at: 2026-10-08
status: ready
---

# Skill Feedback: build-forms

## Executive Summary

An agent refactored three create/edit forms inside a repository that already
had a typed form factory (`createFormWrapper` returning a typed root and hook,
with a `context` object for non-field state) and compact field adapters
(`TextField`, `SwitchField`, … taking `name`, `label`, `description`,
`control`). The agent ignored that layer and hand-built each form with raw
`useForm`, a spread shadcn `<Form {...form}>`, inline `FormField` render blocks
and prop-drilled `pending`/option props. That matched neither the repository nor
the skill's own example. The user rejected it and named a sibling repository's
form layer as the required shape.

The accepted fix rebuilt every form on the incumbent factory and adapters and
added a compact `SelectField({ options, slotProps })`. The skill should:

- make discovering and reusing an incumbent form factory a hard first step;
- detect forms that bypass it during audit;
- adopt the compact adapter style the user prefers as its default field API.

This report improves the skill, not the originating feature.

## Project Context

- Task: refactor three catalog create/edit forms (two full pages, one dialog)
  for usability, frontend only, delegated to a subagent and then corrected by
  the orchestrating agent.
- Stack and conventions:
  - Next.js 16 App Router, React 19 with React Compiler, Tailwind v4, and
    shadcn/Radix primitives.
  - react-hook-form 7.66, zod 4 and `@hookform/resolvers`; TanStack Query
    mutations.
  - The repository's shared form module exports `createFormWrapper<T, TContext>()`
    (schema typed `ZodType<T, T>`), compact adapters with a shared
    `FormFieldProps`, and `createStringValidator`.
  - One existing feature (permissions) already used that module.
- Skill invocation:
  - `$build-forms` was read by the orchestrator and named in the subagent brief.
  - The subagent was told the shadcn form primitive exists and was not told
    about the factory.
- Evidence reviewed:
  - The first commit (`3acf917`) and the corrective commit (`4c104f6`) on the
    same branch.
  - The incumbent `features/form/components/form-wrapper.tsx`, the sibling
    reference repository's `SelectField`, the skill's `SKILL.md`,
    `references/review-and-testing.md` and `examples/typed-feature-form`.
  - Direct user correction.
  - A browser pass of the accepted forms covering validation messages, focus
    on the first invalid field, dirty state and select rendering.

## Findings

### F-001: Reuse the incumbent typed form factory before applying the skill's API

- Category: ambiguous-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

A repository has an established typed form factory and field adapters, and the
task touches forms in a feature that has not used them yet.

#### Evidence

- User correction (translated from Turkish): "There is a problem with the forms.
  Check genie-website, it must be done this way, but your forms are wrong."
- Origin (do not ingest): `3acf917` `features/core-ai/components/providers-create.tsx:10,60,75`
  imports `Form, FormField, FormItem…` from `@/components/ui/form` and renders
  `<Form {...form}>` with inline `<FormField … render={…}>` blocks.
- The incumbent existed at `features/form/components/form-wrapper.tsx:88`
  (`createFormWrapper`) and was consumed by
  `features/permissions/components/permission-set-form.ts:3`.
- `SKILL.md:168` scopes "Decision defaults" to repositories with "no
  established convention". Meanwhile the Core contracts (lines 70–122) and the
  example (`createForm`, compound slots, a Zustand properties store) read as
  unconditional.

#### Current behavior

The agent did not search for an existing factory. It treated the shadcn
primitive as the form foundation and produced a third pattern. That pattern
matched neither the incumbent nor the skill's example.

#### Preferred behavior

Before designing anything, locate the repository's typed form factory, field
adapters and their most recent consumer. When they exist, build on them in
their own vocabulary (root name, hook name, context or properties mechanism,
adapter props). Gaps against the skill's contracts become reported audit
findings, not a reason to create a parallel API.

#### Proposed skill change

Add a sub-step to Required workflow step 1 in `SKILL.md`:

"Find the incumbent form layer before anything else. Search for a typed-form
factory (`createForm`, `createFormWrapper`, `FormWrapper`, a custom
`useFormContext` wrapper), compact adapters (`*-field.tsx`, a shared
`FormFieldProps` type) and their newest consumer. If one exists, the new form
uses that factory, its hook and its adapters. Add any missing adapter in the
same style, next to the existing ones."

Also state at the top of Core contracts that they describe a fresh foundation
and serve as an audit lens for an incumbent one.

#### Generalization test

- Applies to any repository with a shared typed form root or adapter set,
  whatever it is named.
- Does not apply when the repository has only raw `useForm` calls and no shared
  root; then the skill's defaults hold.
- Counterexample: a factory that is deprecated or explicitly scheduled for
  removal in repository instructions should not be extended.

#### Acceptance criteria

- On a fresh fixture repository containing `createFormWrapper` plus
  `TextField` and `SwitchField` adapters, a new two-section form imports that
  factory and those adapters. It contains no `useForm` call and no new root
  component.
- The skill's form model (workflow step 2) names the incumbent factory and the
  adapters it will reuse, or states that none exists.

### F-002: Choose among mixed form incumbents deterministically

- Category: missing-rule
- Severity: medium
- Recurrence: repeated
- Confidence: medium

#### Scenario

A repository contains two coexisting form styles: legacy route-local forms that
call `useForm` directly, and a newer shared factory with adapters and tests.

#### Evidence

- Origin (do not ingest): four route pages call `useForm` directly
  (`app/dashboard/services/new/page.tsx`,
  `app/dashboard/services/[id]/edit/page.tsx`,
  `app/dashboard/requests/new/[service]/page.tsx`,
  `app/dashboard/requests/new/bulk/page.tsx`).
- The factory has integration tests
  (`features/form/tests/integration/form-wrapper.test.tsx`) and a feature
  consumer.
- A search for "how this repo builds forms" returns both styles.

#### Current behavior

Nothing in the skill tells the agent which incumbent wins. The raw `useForm`
pages also gave the subagent's choice a plausible precedent.

#### Preferred behavior

Prefer the incumbent that is a shared, typed and tested abstraction over
route-local or one-off usage. If two shared abstractions compete, ask the user
once and name both.

#### Proposed skill change

Add one bullet beside the F-001 step:

"When several form styles coexist, the shared typed factory with adapters and
tests is the incumbent; raw per-screen `useForm` code is legacy to migrate
opportunistically, not a precedent. Ask once only if two shared factories
compete."

#### Generalization test

- Applies wherever old and new form styles coexist mid-migration.
- Does not apply when the only shared abstraction is a thin primitive
  re-export, such as shadcn `Form` being `FormProvider`; that is a primitive,
  not a factory.

#### Acceptance criteria

- A fixture with three raw-`useForm` screens and one factory consumer yields a
  new form on the factory.
- A fixture with two competing factories produces exactly one clarifying
  question naming both.

### F-003: Audit for feature forms that bypass the typed root

- Category: validation-gap
- Severity: high
- Recurrence: repeated
- Confidence: high

#### Scenario

The agent reviewed the delegated forms and passed them, although each one
bypassed the shared typed root.

#### Evidence

Origin (do not ingest), `3acf917`:

- `deployments-create.tsx:28-29` passes `providers={providers}` and
  `pending={createMutation.isPending}` into the form component.
- `deployment-form.tsx:64,78-79,133` spreads `<Form {...form}>` and drills
  `providers`/`original`/`pending` into sections.
- `pricing-edit-dialog.tsx:77-79` reads `updateMutation.isPending` and
  `form.formState.isDirty` inline in the dialog footer.
- `references/review-and-testing.md` "Audit" (lines 9–34) has no check for any
  of these.

#### Current behavior

The audit checklist inspects slot internals (refs, ARIA, providers) but never
asks whether the feature form uses the typed root at all.

#### Preferred behavior

The audit flags feature code that:

- calls `useForm` outside the typed root;
- spreads a form instance into a provider;
- passes `UseFormReturn`, submit-pending state or read-only option data
  through section props that the root's context or properties could carry;
- renders inline `FormField` blocks for a control that already has an adapter.

#### Proposed skill change

Add these four checks to the Audit list in `references/review-and-testing.md`,
each with a one-line grep hint (`useForm(`, `{...form}`, `pending=`,
`render={({ field })`). Add the same four as a "never" bullet under Feature
form in `SKILL.md`.

#### Generalization test

- Applies to every feature form with more than one section or a separate
  footer.
- Does not apply to a single-field inline form (for example a search box)
  where a typed root adds nothing.

#### Acceptance criteria

- Running the skill's audit on the fixture from F-001, seeded with a
  raw-`useForm` variant, reports all four violations.
- The skill example's submit footer reads pending state from the root
  (`context.isPending` or a properties selector), not from a prop.

### F-004: Keep field-shaped values when the root cannot carry schema transforms

- Category: missing-rule
- Severity: medium
- Recurrence: once
- Confidence: high

#### Scenario

A numeric field is typed as text so that tiny decimals are not rounded. The
schema used `.transform(Number)`, but the repository's root types its schema as
`ZodType<T, T>`, so input must equal output.

#### Evidence

- Origin (do not ingest): `3acf917` `features/core-ai/utils/pricing-form.ts:31,40-41`
  uses `.transform((value) => Number(value))` with separate
  `z.input`/`z.output` types.
- `features/form/components/form-wrapper.tsx:25` types the schema as
  `ZodType<T, T>`, so this schema cannot be passed to the incumbent root.
- The skill example's `Form` supports `TTransformedValues`
  (`examples/typed-feature-form/src/components/ui/form.tsx:27-37`), so the
  skill assumes transforms are always available.

#### Current behavior

The transform pushed the agent off the incumbent root, onto raw `useForm`.

#### Preferred behavior

Check the root's schema generic first. If input and output must match, keep
the value in the shape the control produces (a string for a typed number) and
convert in the submit payload mapper. Unit-test the mapper.

#### Proposed skill change

Add to Feature form in `SKILL.md`, with a snippet in
`references/workflows-and-submission.md`:

```ts
// skill example (ingest this)
const priceFormSchema = z.object({
  amount: z.string().trim().regex(/^\d+(\.\d+)?$/, "Enter a number such as 0.25"),
})
type PriceFormValues = z.infer<typeof priceFormSchema>

export function createPricePayload(values: PriceFormValues) {
  return { amount: Number(values.amount) }
}
```

#### Generalization test

- Applies to any root whose resolver typing forbids distinct input and output.
- Does not apply when the root supports transformed values; there a
  `z.coerce`/`transform` schema is acceptable.
- Counterexample: dates that must be `Date` objects in several descendant
  sections may justify extending the root's generics rather than stringly
  values.

#### Acceptance criteria

- The skill states the check ("does the root accept distinct input and output
  types?") before recommending a transform.
- The workflows reference contains the payload-mapper example and a matching
  unit-test case.

### F-005: Make compact option-and-slot-prop adapters the default field API

- Category: ambiguous-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

The user's reference repository and the accepted implementation use compact
adapters. Examples are `SelectField({ name, label, description, control,
options, placeholder, slotProps: { select, selectTrigger, selectContent,
selectItem } })` and `TextField({ name, label, description, control,
...inputProps })`. The skill forbids parent prop bags and makes compound slot
families primary.

#### Evidence

- Origin (do not ingest): the user named the sibling repository's form layer as
  the target ("it must be done this way").
- That repository's `SelectField` takes `options` and `slotProps`. The accepted
  `features/form/components/select-field.tsx` ports it.
- Asked directly whether the skill should ban, tolerate or adopt this style,
  the user chose "make the reference adapter style the skill's default".
- Skill text that conflicts: `SKILL.md:73-75` ("Expose `SelectFieldTrigger`…
  instead of tunneling … `triggerProps`, `contentProps` … prop bags") and
  `SKILL.md:190-191` ("Compound families are the primary API; compact fields
  are optional secondary compositions").

#### Current behavior

Followed literally, the skill pushes agents to replace or wrap working compact
adapters with compound families. In this task that made the "correct" skill
output differ from what the user wanted.

#### Preferred behavior

The default public field API is one compact adapter per control:

- Required props: `name`, `label`, optional `description`, and `control`.
- Data props for the control's contents: `options`, `placeholder`.
- Remaining primitive props go to the main control (`...inputProps`).
- One typed `slotProps` object, keyed by inner part, carries props for
  secondary parts.

Bindings, IDs and ARIA still live once inside the adapter. Compound slots stay
available underneath for layouts the compact API cannot express, but they are
the escape hatch, not the primary API.

#### Proposed skill change

- Reverse `SKILL.md:190-191` to "Compact adapters are the primary API; compound
  slots are the escape hatch."
- Replace the prop-bag ban at `SKILL.md:73-75` with a contract for `slotProps`:
  - one object;
  - keys named after the primitive parts;
  - each value typed as that part's props minus the bindings the adapter owns
    (`value`, `onValueChange`, `ref`, `aria-*`, `id`);
  - authoritative bindings applied after the spread.
- Update `examples/typed-feature-form` so its feature sections use compact
  adapters.
- Add a review check that `slotProps` never overrides owned bindings.

```tsx
// skill example (ingest this)
<SelectField
  name="plan"
  label="Plan"
  description="Billing starts today."
  control={control}
  options={[{ value: "pro", label: "Pro" }]}
  slotProps={{ selectTrigger: { className: "font-mono" } }}
/>
```

#### Generalization test

- Applies to the common case of a label, control, description and error in the
  standard order.
- Does not apply to custom anatomy, such as a checkbox card with the label
  inside the control or an error rendered in a toolbar. That anatomy uses the
  compound slots.
- Counterexample: a design system that already ships compound-only field
  families keeps them (F-001 precedence).

#### Acceptance criteria

- The skill example renders every standard field through a compact adapter, and
  at least one custom layout through compound slots.
- A review of `slotProps` typing shows owned bindings are omitted from each
  slot type and applied after the spread.

### F-006: Tie native `required` to the root's `noValidate`

- Category: ambiguous-rule
- Severity: low
- Recurrence: once
- Confidence: medium

#### Scenario

The skill says to preserve native `required`. The incumbent root renders a
`<form>` without `noValidate`, so native `required` would show browser bubbles
and block the schema's own messages.

#### Evidence

- Origin (do not ingest): `features/form/components/form-wrapper.tsx:63-69`
  renders `<form onSubmit=… className=…>` with no `noValidate`.
- The skill example's root defaults `noValidate = true`
  (`examples/typed-feature-form/src/components/ui/form.tsx:55,90`).
- The accepted implementation used `aria-required` on required inputs instead.

#### Current behavior

The rule "preserve native `required`" (`SKILL.md:89`) silently assumes the
skill's own root. On an incumbent root it either degrades the error UX or
forces an unstated shared-root change.

#### Preferred behavior

Use native `required` when the root sets `noValidate`. Otherwise reflect
required state with `aria-required` and report "add `noValidate` to the shared
root" as a follow-up.

#### Proposed skill change

Amend the `required` bullet in `SKILL.md` Field families and the matching line
in `references/field-contracts.md` with that condition.

#### Generalization test

- Applies to any root not created by the skill.
- Does not apply when the root sets `noValidate`.

#### Acceptance criteria

- The skill text states the `noValidate` dependency explicitly.
- On a fixture root without `noValidate`, an empty submit shows schema
  messages, not browser bubbles.

### F-007: Fix the duplicated, partly broken typed-feature-form example

- Category: bad-example
- Severity: medium
- Recurrence: structural
- Confidence: high

#### Scenario

The agent read the skill example to learn where the foundation lives and how it
is imported.

#### Evidence

- `examples/typed-feature-form/src/components/ui/{form,input-field,select-field}.tsx`
  and `examples/typed-feature-form/src/features/form/components/{form,input-field,select-field}.tsx`
  are identical except for imports. The second location is not mentioned in any
  skill Markdown file.
- The `components/ui` copies import `composeRefs` from
  `@/.agents/skills/build-forms/examples/typed-feature-form/lib/compose-refs`.
  That directory does not exist; the file is at `…/typed-feature-form/src/lib/compose-refs.ts`.

#### Current behavior

The example presents two foundation homes with no guidance. One copy has an
unresolvable import, which weakens the "type-checked example" claim in
`SKILL.md:157-166`.

#### Preferred behavior

The example has one foundation location. Its imports resolve, and it
type-checks in CI.

#### Proposed skill change

- Delete one copy, or document both as alternative placements in
  `references/architecture.md`.
- Fix the `compose-refs` import to `src/lib/compose-refs`.
- Add the example to the skill repository's typecheck validation.

#### Generalization test

Applies to every bundled example that is described as type-checked.

#### Acceptance criteria

- The skill repository's typecheck covers the example and passes.
- A search for `compose-refs` imports in the example returns only resolvable
  paths.

### F-008: Report inherited primitive ARIA gaps instead of silently accepting them

- Category: validation-gap
- Severity: low
- Recurrence: repeated
- Confidence: high

#### Scenario

The adapters build on the shadcn `FormControl`. It always lists the description
ID in `aria-describedby`, even when no description renders.

#### Evidence

- Origin (do not ingest): `components/ui/form.tsx` `FormControl` sets
  `aria-describedby` to the description ID unconditionally.
- A browser pass of a field without a description showed a reference to a
  missing element.
- The skill rule exists (`SKILL.md:86-88`), and extension test 1 would catch it
  (`references/review-and-testing.md:40-41`). The skill gives no guidance on
  what to do when the offending primitive is an incumbent outside the task's
  scope.

#### Current behavior

The agent noticed the gap and left it unreported in the change, because the
skill gives no path between "rewrite the primitive" and "ignore".

#### Preferred behavior

When an inherited primitive breaks a skill accessibility contract and fixing it
is out of scope, record it as a pre-existing finding in the handoff, naming the
contract and the primitive. Do not patch it silently or drop it.

#### Proposed skill change

Add to Required workflow step 6 in `SKILL.md`:

"Report preserved contracts, unresolved assumptions, and inherited primitive
violations of the accessibility contracts as pre-existing findings."

#### Generalization test

- Applies to any incumbent primitive the task does not own.
- Does not apply when the task owns the primitive; then fix it.

#### Acceptance criteria

The handoff template lists "pre-existing contract violations" as its own item,
and an audit of the fixture's shadcn `FormControl` produces that item.

### F-009: Make the form model the handoff artifact for delegated form work

- Category: missing-rule
- Severity: medium
- Recurrence: once
- Confidence: medium

#### Scenario

An orchestrating agent delegated form implementation to a subagent with a
free-text brief.

#### Evidence

- Origin (do not ingest): the orchestrator's brief told the subagent that the
  shadcn form primitive exists. It did not mention the shared factory, which
  steered the subagent to the primitive.
- The skill's form model (workflow step 2) was never written, so nothing
  forced the incumbent to be named.

#### Current behavior

Delegation lost the most important decision, which foundation to build on,
because the skill treats the form model as internal reasoning.

#### Preferred behavior

The form model is a written artifact. It names:

- the incumbent factory and adapters, or "none";
- the root and hook names;
- the non-field state mechanism;
- which adapters are added.

When work is delegated, the model is passed verbatim, and the delegate verifies
it against the repository before coding.

#### Proposed skill change

In Required workflow step 2 of `SKILL.md`, add "Incumbent factory and adapters"
as the first line of the form model. Add:

"When delegating, include the form model verbatim in the brief; the delegate
confirms it with a repository search before editing."

#### Generalization test

- Applies to any delegated or multi-agent form task.
- Does not apply to single-agent work, where it is still useful but not
  load-bearing.

#### Acceptance criteria

- The form model template in the skill starts with the incumbent line.
- A delegated fresh task's brief contains the model, and the delegate's first
  action is a factory search.

## Cross-Cutting Decisions

- **User preference (user-stated):** the sibling repository's form layer is the
  target shape. That means one typed factory per feature returning
  `{ FormWrapper, useFormWrapper }`, a `context` object for non-field state
  such as `isPending`, and compact adapters with `slotProps`. F-005 adopts it
  as the skill default, and F-001 makes any incumbent win over the skill's own
  example API.
- **Terminology:**
  - "incumbent form layer" means the factory plus adapters already in the
    repository;
  - "compact adapter" means a single-component field API;
  - "compound slots" means the open Root/Label/Control/Description/Error parts.
- **Non-field state:** the skill's scoped Zustand properties store and the
  incumbent's plain context object both satisfy "descendants read it from the
  root, not from props". The skill should present the store as the choice for
  frequently changing properties, and a plain context value as acceptable for
  rarely changing ones such as pending state, edit mode and option lists.
- **Layer placement:** every proposal stays within the skill's field-family
  and feature-adapter layers; no family reads a query or a product rule.

## Validation Requested

- `node .agents/skills/evolve-skills-from-feedback/scripts/validate-feedback.mjs .agents/feedback/build-forms/2026-10-08-incumbent-form-factory.md`
- After ingest, typecheck `build-forms/examples/typed-feature-form` in the
  skill repository's CI (F-007) and re-run the skill's audit on its own
  example.
- Fresh-task prompt: "This repository already has a shared typed form factory
  with Text, Switch and Select adapters and one feature using it. Add a
  two-section create form with a submit footer showing pending state." Pass
  when the result uses the factory and adapters, has no `useForm` call in
  feature code, and the footer reads pending state from the root.
