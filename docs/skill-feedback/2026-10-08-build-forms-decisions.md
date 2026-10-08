# October 8 2026 build-forms feedback decisions

The report is preserved unchanged and passes the canonical validator:
[Incumbent form factory](../../.agents/feedback/build-forms/2026-10-08-incumbent-form-factory.md).

## Source and evidence

The report targets React Skills v3.1.1, which is the current source. Every
"current behavior" quote about `SKILL.md`, `references/review-and-testing.md`,
and the example's `Form` was found as quoted. The originating dashboard
repository is unavailable; its commits, paths, and the user's correction are
reported evidence and were not reproduced here.

F-007 was checked against the source and reproduced. The source example has
one foundation location, its imports resolve, and `tsconfig.examples.json`
already type-checks it. Two installer behaviors explain what the agent saw:

- `shadcn add` rewrites every `@/` import that points at another file of the
  same registry item into an unresolvable `@/.agents/skills/...` path without
  `src/`. A local `shadcn add` of `public/r/build-forms.json` produced exactly
  the reported `compose-refs` import, and the same rewrite hits
  `proposal-form.ts` and `proposal-details.tsx`.
- The v3.0.0 move from `features/form/components` to `components/ui` left the
  old copies in place, because an update does not prune example files a
  release removed.

Both are catalog-wide installer issues, not build-forms content, and are
tracked as a separate follow-up.

## Shared design

The user named a sibling repository's form layer as the target shape and,
asked directly, chose to make its adapter style the skill default. Two
decisions follow:

- An incumbent typed form factory with adapters wins over the skill's own
  example API. The core contracts describe a fresh foundation and are the
  audit lens for an incumbent one.
- The default public field API is one compact adapter per control with a
  typed `slotProps` object; compound slots remain underneath as the escape
  hatch for custom anatomy. This reverses the "compound families are the
  primary API" default and replaces the field prop-bag ban with a `slotProps`
  contract. General composable families in `build-composable-components` keep
  the slot rule; the stack guide records the form-field exception.

Non-field state keeps both mechanisms: the scoped Zustand properties store
for the fresh foundation, and an incumbent's plain context value for rarely
changing values. Query-backed option lists stay with their query hook, as the
existing properties rule already required.

## Decisions

| Finding | Decision | Destination | Reason | Validation |
| --- | --- | --- | --- | --- |
| F-001 | accepted | `SKILL.md` workflow step 1 and the Core contracts preamble; "Incumbent form layers" in `architecture.md` with a vocabulary map | Structural and high-impact; the proposed wording is kept, plus the deprecated-factory counterexample | Forward test (below) |
| F-002 | accepted | Sub-bullet of workflow step 1; the thin `FormProvider` re-export case is named as a primitive, not a factory | Matches the report's generalization test and keeps one question for two competing factories | Forward test fixture has three raw `useForm` screens |
| F-003 | accepted | "never" bullet under Feature form in `SKILL.md`; "Bypass checks" table with search hints in `review-and-testing.md` | The pending-state hint also lists `isPending=` and `form=`, because the reported prop names vary. The example footer already reads `formState.isSubmitting` from the typed hook | Forward test; audit of the example |
| F-004 | accepted | Feature form bullet in `SKILL.md`; "Field-shaped values" in `workflows-and-submission.md` with the payload mapper and a case-table test | The canonical example keeps transforms because its root supports `TTransformedValues`, which the report's own generalization test allows | Reference review |
| F-005 | accepted | `SKILL.md` Field families and Decision defaults; "Compact adapters and slot props" in `architecture.md`; "Compact adapters" table in `field-contracts.md`; slot typing audit checks; `CompactField`, `InputField`, and `SelectField` in the example; the `proposal` sections now use adapters plus one compound layout (a title counter in the label row); stack guide Component API row | Direct user decision. Slot types derive from the compound slot props, which already omit owned IDs and ARIA, so owned bindings cannot be passed; `options` values are typed from the field value | Typecheck; a negative typecheck rejected `selectTrigger.id`, `selectTrigger["aria-invalid"]`, `fieldLabel.htmlFor`, `value` on `InputField`, an option outside the enum, and an unknown field name |
| F-006 | accepted | `required` bullet in `SKILL.md`; Browser hints and Input sections of `field-contracts.md` | The rule names which native constraints block submission; `maxLength` stays safe without `noValidate` | Reference review |
| F-007 | adapted | No skill change; installer follow-up | The source already has one foundation, resolvable imports, and CI typecheck coverage. The duplicate and the broken import come from the installer (see Source and evidence) | Local `shadcn add` reproduction |
| F-008 | accepted | Workflow step 7 in `SKILL.md`; "Handoff" in `review-and-testing.md` with the shadcn `FormControl` example | Gives the agent a path between rewriting an unowned primitive and ignoring it | Reference review |
| F-009 | accepted | Workflow step 3 in `SKILL.md`: the form model is a written artifact that starts with the incumbent line and is passed verbatim to a delegate | The delegation brief was where the incumbent got lost | Forward test reports the model |

The description now names incumbent reuse, compact adapters with typed slot
props, and auditing forms that bypass the typed root. `SKILL.md` stays under
220 lines.

## Forward test

A fixture app with a shared `createFormWrapper` (schema typed
`ZodType<T, T>`, a `context` object, no `noValidate`), `TextField` and
`SwitchField` adapters on the shadcn `Form` primitive, one consumer, three
legacy screens with raw `useForm`, and no Select adapter. The task asked for a
two-section create form with a select, two switches, and a pending submit
footer, without mentioning the factory. One run used this change and one used
v3.1.1 (Opus 5.5, one repetition each); both type-check:

| Check | v3.1.1 | This change |
| --- | --- | --- |
| Builds on `createFormWrapper`, `TextField`, `SwitchField`; no `useForm`, `{...form}`, or inline render block in feature code | yes | yes |
| Footer reads pending state from the root's `context` | yes | yes |
| Missing Select adapter | added with compound children: the screen composes trigger, value, content, and items | added as a compact adapter in the incumbent style: typed `options`, `placeholder`, and `slotProps` without owned bindings |
| Required fields on a root without `noValidate` | native `required`, so browser bubbles precede schema messages | `aria-required`, "add `noValidate`" reported |
| Shared factory | changed (`onSubmit` signature) | unchanged; gaps reported |
| Form model names the incumbent first; inherited `FormControl` ARIA gap reported as pre-existing | partly (gap noted) | yes |

Both runs found the factory here, because its only consumer sits beside the
target feature and the task was not delegated through a brief that named the
primitive. The fixture therefore confirms F-005, F-006, F-008, and F-009, and
does not separate the variants on F-001 discovery alone.
