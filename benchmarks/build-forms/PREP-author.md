# build-forms lean-v1: author report

Candidate: `benchmarks/build-forms/variants/lean-v1/` (copied from
`skills/build-forms/` without README.md, registry.json, adapters/).
Not read: `benchmarks/build-forms/tasks/`, any `results/`, other `PREP-*.md`.

Inputs read: `benchmarks/LESSONS.md`, the build-composable-components lean-v6
variant (SKILL.md, review-and-testing.md, parts of the other references),
`docs/technology-stack.md`, `docs/adding-a-skill.md`, the three decision
ledgers in `docs/skill-feedback/`, and the git history of `skills/build-forms`.

## Word counts (Markdown, `wc -w`)

| File | Before | After |
| --- | ---: | ---: |
| SKILL.md | 1502 | 1403 |
| references/architecture.md | 1054 | 709 |
| references/field-contracts.md | 609 | 800 (absorbed browser-and-ux) |
| references/browser-and-ux.md | 731 | removed (merged) |
| references/workflows-and-submission.md | 494 | 425 |
| references/review-and-testing.md | 670 | 436 |
| references/examples.md | 792 | removed (index moved to SKILL.md) |
| **Markdown total** | **5852** | **3773 (-35.5%)** |
| agents/openai.yaml | 32 | 32 (unchanged) |
| examples/typed-feature-form (code) | 1834 | 1834 (unchanged) |

SKILL.md: 194 lines (limit 220). Sections kept: YAML name/description
(description unchanged), Version, Layer placement (verbatim), Required
workflow, Core contracts, Companion skill routing, References, Decision
defaults.

## Example code

Unchanged. Type-checked the variant copy with a scratch tsconfig mirroring
`tsconfig.examples.json` (paths `@/*` -> the variant's `src`, plus
`typecheck/build-forms-shadcn.d.ts`): `tsc` passes, 12 variant files checked.
The skill ships no scripts.

## Decisions that must keep working (all retained)

- Ledger 2026-09-07 F-005: reciprocal routing to `$use-preferred-react-stack`,
  `$extract-named-helpers`, `$build-composable-components`,
  `$manage-server-state` - all four routes kept.
- Ledger 2026-09-07 "Forms now express fresh-stack defaults": RHF + Zod for
  fresh choices, preserve incumbents - kept in Decision defaults.
- Ledger 2026-09-24: form interaction tests stay with this skill; "do not
  introduce a new test framework only for one form change" kept.
- Commit-history decisions (user corrections): no fused StepperForm/CardForm/
  DialogForm (3de24a2); shadcn Button in form actions (74bbb32); typed root
  calls `useForm` once with props passed directly (898e6fe); scoped Zustand
  `properties` with only `StoreApi` in context, no `zustand/context`, no
  module-global store, separate from resolver `context` (4eceb3d); Form +
  compound-field foundation together in `form.tsx`, `composeRefs` directly in
  `utils/index.ts`, no barrels (0e774a1); cohesive `<feature>-form.ts`, no
  one-file `schemas/types/constants/logic` folders (e050672, ddf9ddb); browser
  hints on the Control slot, no universal defaults (05fa755). All kept.

## Cuts and merges, with reasons

SKILL.md
- Required workflow: 8 steps -> 6. Steps 1-3 (read, trace, classify) merged
  into one; step 7's scenario list now links to the extension tests with a
  short inline list. Same content, fewer restatements.
- Core contracts grouped under Ownership / Field families / Feature form
  (lean-v6 shape). Each rule stated once; wording of boundaries kept (fused
  API list, Select provider boundary, slot-owned props, `useForm` once,
  Zustand store rules).
- `aria-describedby` rule made more precise by folding in the reference's
  "error ID only while invalid" detail, so the reference no longer restates it.
- Dropped "Keep label association and error focus correct" from core: both are
  stated concretely in architecture.md (`htmlFor`) and
  workflows-and-submission.md (focus first invalid control).
- Companion routing: the scripted install-dialog example cut (generic); the
  install command generalized to `<skill>` as in lean-v6; "not a hidden
  prerequisite / do not repeat" kept.
- "Read focused guidance" list replaced by a References list with one-line
  scopes; the examples.md index (what the example demonstrates, "expects
  existing shadcn primitives, do not reinstall or rewrite them") moved here.
- Decision defaults: barrel default shortened (the utils rule is already in
  the first default).

references/examples.md (removed)
- "Complete example" bullet list: compressed into the SKILL.md References
  entry.
- "Refactor a large form component", "Inject typed form-wide properties",
  "Keep form configuration explicit", "Preserve Form and Stepper
  independence": examples that mirror likely tasks and restate core contracts.
  Their unique rules were kept once elsewhere: factory never captures schema/
  defaults (architecture.md, with reason), descendants needing reset/server
  errors call the typed hook (architecture.md), no submitted values/Stepper/
  server records in the properties store (architecture.md), no step state in
  `createForm` (workflows-and-submission.md). Card/Form nesting snippet cut:
  core contract already says render separate components.

references/browser-and-ux.md (removed, merged)
- "Bind once" list merged into architecture.md Accessibility relationships
  (it duplicated that section).
- "Choose semantic hints" merged with field-contracts' Input paragraph into one
  "Browser hints" section in field-contracts.md.
- "Preserve browser behavior" -> field-contracts.md "Browser behavior".
- "Make errors recoverable" -> workflows-and-submission.md "Recoverable
  errors".
- "Verify real interaction" merged into extension tests; MDN/W3C links cut
  (generic references).

references/architecture.md
- Responsibility-map diagram cut: restates Layer placement and the core
  ownership contracts.
- InputField usage snippet cut: the example's `proposal-details.tsx` and the
  Select "prefer" snippet carry the shape.
- `createForm` and screen snippets cut: identical to `proposal-form.ts` and
  `proposal-screen.tsx`, now linked directly. Selector snippet kept (short,
  carries the narrow-slice shape).
- Two file trees merged into one Placement tree with role annotations.
- Split rule ("only when independently reusable...") kept once in SKILL.md.

references/field-contracts.md
- Compact-field text from architecture.md merged into "Compact fields".
- Select "verify opening/selection/portal/focus" moved to extension tests
  (already listed there).

references/workflows-and-submission.md
- "Companion skill recommendations" cut: duplicates SKILL.md routing.
- Fused-API paragraph cut: duplicates the core contract.

references/review-and-testing.md
- 27-item checklist reduced to "check every core contract and the touched
  reference" plus 10 items not stated as rules elsewhere (lean-v6 pattern).
- Extension tests and verification depth kept, lightly compressed; the
  accessibility-tree check moved here from browser-and-ux.

## Additions (each is a hypothesis to measure)

1. Decision default naming: one `<control>-field.tsx` per family exporting
   `<Control>FieldRoot`, `<Control>FieldLabel`, `<Control>FieldControl`; a
   feature has `<feature>-form.ts`, `<feature>-screen.tsx`, and
   `components/<feature>-<section>.tsx`. Describes what the example already
   does; aimed at structural consistency (LESSONS: naming defaults raised
   consistency in lean-v6).
2. Routing: `$build-composable-components` now also names "a primitive's typed
   `size` or `variant`", pointing className-patch situations to the owner of
   the owner's typed size/variant rule without restating it here.
3. Architecture: "Omit internally authoritative IDs and ARIA props from leaf
   prop types" replaces "Reserve ... from", matching what the example does.

## Uncertain

- Folding browser-and-ux into field-contracts and workflows changes where an
  agent finds those rules; SKILL.md's References list names both locations.
- Generic browser advice (visible labels, no paste blocking, autofocus,
  touch targets) was kept compressed rather than cut; it came from a
  user-driven commit, but a strong model may already apply it.
- The default "control-specific contexts only for item identity" predates and
  slightly conflicts with the example's `SelectFieldControlContext` (carries
  `required`); left as in baseline.
- The owner's "generic components in `components/ui` named by UI role" bar is
  met here only through the stack's documented exception: shared field
  families live in `features/form`, which the technology contract names as the
  family location for forms. Not changed.
