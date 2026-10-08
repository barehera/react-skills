# extract-named-helpers lean-v1: author report

Variant: `benchmarks/extract-named-helpers/variants/lean-v1/` (copied from
`skills/extract-named-helpers/` without README.md, registry.json, adapters/).
Not read: `tasks/`, any `results/`, other `PREP-*.md`.

## Word counts (wc -w)

| File | Baseline | lean-v1 |
| --- | ---: | ---: |
| SKILL.md | 1059 (178 lines) | 1299 (176 lines) |
| references/extraction-triggers.md | 490 | removed (merged) |
| references/placement.md | 392 | 219 |
| references/signatures-and-naming.md | 181 | removed (merged) |
| references/hooks-and-helpers.md | 176 | removed (merged) |
| examples/inspection.ts | 152 | 152 (unchanged) |
| examples/use-inspection-status.ts | 97 | 97 (unchanged) |
| agents/openai.yaml | 32 | 32 (unchanged) |
| **Total** | **2579** | **1799 (-30.2%)** |

Prose only (SKILL + references): 2298 -> 1518 (-34%).

## Structure

SKILL.md keeps frontmatter (description verbatim), Version, Layer placement
(verbatim), Required workflow, Extraction triggers, Do not extract, a new
`## Auditing existing helpers` section (moved from the reference), Placement,
Signature and naming, Hooks and helpers, Companion skill routing, References.
One reference remains: `references/placement.md` (worked placement examples).

## Cuts and merges, with reasons

Extraction triggers (reference -> SKILL):
- Checklist chain code block cut; its one rule kept as a sentence: `every`
  alone is true for an empty array, do not replace a nonempty completion rule
  with a vacuous one (a precise edge case models miss).
- Updater example merged into one sentence: extract as
  `update(previous => toRestartedDraft(previous))`, keep the current-value
  callback, no stale snapshot.
- "Do not extract a callback merely because it contains a short ternary"
  merged into the Do-not-extract single-use sentence.
- Inline code block (`canSubmit`, `targetId ?? `, single filter) cut: it
  restated the Do-not-extract prose, which already carries `canSubmit`.
- Hoisting code block and "predicate reads pending state / can throw / ran
  after another effect" cut as covered by "order, conditions, exceptions, and
  call count stay equivalent"; the concrete `await` / cancellation / early
  return clause was kept verbatim in SKILL.

Auditing (2026-09-29 ledger F-001):
- Moved into SKILL as its own section so the SKILL closing sentence and the
  reference bullets no longer restate each other. Kept: create-vs-audit
  boundary sentence, all four verdicts (keep / inline / narrow / `revisit` =
  report and leave code unchanged, not on caller count alone), keep and
  inline examples (`toDayEndDateTime`, `isReadyToSave`), the `getItemCount`
  counterexample, the one-line-fallback tension, and "criteria decide
  naming; export and location follow Placement". Workflow step 1 still reads
  planning artifacts when auditing.
- The keep/inline code block became prose (same examples, same verdicts).
- "(often with a Business Logic block)" cut: descriptive, not a rule.

Placement (2026-09-07 F-003; 2026-09-29 F-002, F-003):
- Recorded-consumer definition stated once (in SKILL, the reference's fuller
  wording incl. "sibling screen with the same shape"); the duplicate in the
  audit text and the reference's "speculative only when..." restatement cut.
- Table row 1 now carries "two exports may share one private predicate";
  row 3 adds "a re-export barrel" (from the reference); row 2 adds "import it
  directly". "A second call inside the same file does not earn an export"
  cut as a restatement of row 1.
- Dedicated-module sentence merged from SKILL + reference: independently
  testable policy, server-only dependency, or existing public API, "even with
  one caller".
- Kept in reference: `toDayStartDateTime` recorded-consumer example, pricing
  counterexample, lower-layer export -> `revisit` not moved, avoid/fine
  purpose-split pair. Cut there: "search callers first" (workflow step 1),
  "Shared only receives business-agnostic foundations / entity not
  shared/utils" (SKILL already says no business rules in Shared; FSD routes
  the rest), duplicate `helpers.ts`/barrel line, "consumer count is a default"
  (now "even with one caller" in SKILL).

Signatures and naming (2026-09-07 F-004, F-005):
- `SectionSource` code example cut; the rule (minimal structural type, `Pick`
  of an authoritative type, no `helper(object.field, object)`) stays, and the
  shipped example shows `Pick`. Kept from the reference as clauses: unrelated
  arguments such as value and threshold stay separate; do not add optionality
  to avoid fixing a caller with invalid data.
- Naming examples (`createQuotaMessage`/`handleQuotaError`, `getChecklist`)
  cut as restatements of the prefix table. The `toRestartedDraft` /
  `withClearedResults` sentence cut: the `reset` table row already states
  "copy versus mutation explicit in the type and established vocabulary".
  "Do not rename unrelated APIs on sight" cut: covered by "rename only in
  scope".

Hooks (2026-09-07 F-006):
- Reference cut except two rules folded into SKILL: do not wrap a simple
  selector in an extra hook; do not remove unrelated existing memoization.
  Cut as generic or restated: description of the example, explicit
  formatter/clock inputs (SKILL: inputs passed explicitly), "purity does not
  guarantee compiler optimization", "preserve dependency lists" (workflow
  step 4), "test transitions not textual matches".

Other:
- Companion routing: "Use available companions for their concern" cut; the
  recommend-once / approval / continue sentence kept.
- Comment rule (F-007) kept verbatim.
- References list reduced to placement.md and the two examples.

## Checks

- Examples and `agents/openai.yaml` are byte-identical to the source, so no
  new type-check was needed; `npx tsc -p tsconfig.examples.json` passes and
  `node --test scripts/skill-examples.test.mjs` passes (6/6).
- SKILL.md is 176 lines (< 220) with all contract sections.

## Uncertain

- Removing the hoisting code block and the `SectionSource` example relies on
  prose alone; if runs hoist side effects across ordering-sensitive reads or
  pass `field, parent`, restore those blocks first.
- Moving audit verdicts into SKILL.md makes them load on every create task;
  the "rules above decide whether to create" boundary sentence is meant to
  keep them from leaking into creation.
- Owner's bar: this skill does not speak to components/ui naming or typed
  size/variant; I did not add `features/<feature>` paths to Layer placement
  because domain helpers may live in an FSD entity, not a feature.
- Registry/adapters were excluded per the task; promoting this variant needs
  `npm run skills:sync` (two references removed, one renamed into SKILL).
