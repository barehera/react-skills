# write-feature-tests lean-v1: author report

Candidate: `benchmarks/write-feature-tests/variants/lean-v1/`, copied from
`skills/write-feature-tests/` without `README.md`, `registry.json`, or
`adapters/`. Not read: `tasks/`, any `results/`, other `PREP-*.md`, and the
benchmark fixture.

## Word counts (`wc -w`)

| File | Baseline | lean-v1 | Change |
| --- | ---: | ---: | ---: |
| `SKILL.md` (core) | 1338 | 1272 | -5% |
| `references/case-tables.md` | 1498 | 639 | -57% |
| Prose total | 2836 | 1911 | **-32.6%** |
| `examples/**` (8 files) | 686 | 686 | unchanged |
| `agents/openai.yaml` | 42 | 42 | unchanged |

`SKILL.md` is 156 lines (limit 220). The core shrank little because it
absorbed the reference rules that must be seen on every task (product-chosen
maps, the fits / does-not-fit boundary, reuse of an existing runner); the
reference now holds only material that needs a code shape or a longer reason.

## Verification

- Example code is byte-identical to the source apart from line endings
  (`diff -r --strip-trailing-cr` is empty).
- Typecheck: `tsc -p` with a scratch tsconfig extending
  `tsconfig.examples.json` over the variant's examples: passes.
- Vitest on the variant's examples: 4 files, 14 tests pass.
- The skill ships no scripts.

## SKILL.md changes

| Change | Reason |
| --- | --- |
| Frontmatter, outcome sentence, `## Version`, first Layer paragraph kept verbatim | Contract sections and shared catalog vocabulary |
| Layer placement: "That routes interaction tests; it does not forbid tables elsewhere. A pure ... may use" merged into one sentence with "but" | Same F-004 (2026-09-29) outcome in fewer words: interaction tests routed, library tables allowed |
| Workflow 10 steps -> 8 | Restatements removed, no rule dropped (rows below) |
| Old step 1 + reference "If the repository already has an equivalent table runner, use it and keep its name" merged into step 1 | One runner rule in one place; the reuse rule is a boundary and had to leave the reference |
| Old step 3 detail (`case`/`input`/`expected`, add a row not an `expect`) moved to the first Case tables bullet | Was stated in both places |
| Old step 4 + Decision default "Test file ... do not merge decision files to reduce file count" merged into step 4 | Same rule twice |
| Old step 5 (input only selects the branch, no config snapshot) dropped from workflow | Already the first bullet of "Fixtures are not config defaults", which now carries "never a config snapshot" |
| Old step 7 ("follow When a rule changes") removed | Pointer to a heading in the same file |
| Old steps 2, 6, 9, 10 kept; 2 compressed | Extraction routing, Business Logic ownership (F-004, 2026-09-24), audit removal list (2026-09-29 ledger text), handoff report |
| Case tables: "The repository has one runner; do not add a second runner per feature" removed | Stated in step 1 |
| Case tables: runner bullet gains "per-feature variant" and "a decision that does not fit `input -> result` ... do not bend the runner" | Moved from the deleted reference Runner contract section; boundary |
| Case tables: positional-guard bullet now names `includesOption(options, value)` | Moved from the reference's positional-guard paragraph, which repeated this bullet |
| Case tables: product-chosen map bullet rewritten to carry the reference's map rules (named lookup that only indexes the map; mechanical map gets no table) | F-001 (2026-09-29) outcome kept in the core; the reference copy and its code block duplicated `examples/.../status.ts` and the tone test |
| Fits paragraph merged with the reference's Fits / Does-not-fit table | Table and paragraph said the same thing; kept every boundary (store transition as `{ state, action }`, observing calls/timing/rendered output excluded, HTTP/cache to `$manage-server-state`, journeys to owning skill or e2e root). Dropped the enumerations "Axios transport contract", "TanStack Query cache update", "focus order, keyboard flow" as examples of the same exclusion |
| When a rule changes: seven bullets kept, three pairs of sentences joined; change-detector bullet now links to the reference and says "Cover the behavior it stands for, then delete it" | Same cover-then-delete order as F-002 (2026-09-29) |
| Fixtures: default-read bullet gains its reason ("a pasted literal keeps passing after the default moves") from the reference; contract bullet merged with the "adding a required field must fail" bullet | Reason added once; F-003 (2026-09-24) outcome unchanged |
| Companion closing paragraph compressed to one sentence; "Do not duplicate its full guidance here" dropped | Authoring instruction, not agent behavior |
| "Read focused guidance" (5 links into example files) -> "References" (2 links) | Each file was listed with its role; one folder link with a one-line inventory carries the same routing |
| Decision defaults: "Runner: Vitest, Node" dropped (step 1); "Project policy boundaries" from the reference merged into the project-policy bullet (adds coverage thresholds and snapshot policy) | Restatements; F-003 (2026-09-29) "granularity, not folder policy" sentence kept verbatim |

## references/case-tables.md changes

| Section | Decision | Reason |
| --- | --- | --- |
| Runner contract | Removed | Signature, `describe(decide.name)`, the empty-name throw, `it.each` naming, deep equality, and inferred types are all visible in `examples/rule-tests/src/tests/rule-cases.ts`; the two boundary rules moved to `SKILL.md` |
| What fits a case table | Removed | Table merged into the SKILL Fits paragraph; map rules into the SKILL map bullet; status-tone code duplicated the example files; positional-guard paragraph duplicated a SKILL bullet |
| Change-detectors | Kept verbatim | F-002 (2026-09-29): product-choice check, behavior example, cover-then-delete order, exclusions |
| Worked rule change | "Before" block removed (it is the SKILL table); four bullets reduced to one paragraph | Kept the shape words cannot carry (narrower name, same `expected`, new row). Dropped the Business Logic and "would ask" bullets: both are SKILL "When a rule changes" bullets |
| Defaults contract | Three numbered checks and the loader snippet removed; trust-boundary paragraph and the reasons for key comparison and loader parsing kept | Checks are in SKILL; the snippet duplicated `get-attachment-limit-mb.test.ts` |
| One file per decision | Kept; collection-failure paragraph lightly compressed; "Reducing the file count is not a reason to merge" removed | Stated in SKILL step 4 and the Avoid label; F-003 (2026-09-24 and 2026-09-29) reasons and per-module-policy exception kept |
| Project policy boundaries | Removed | Merged into the SKILL decision default |

## Uncertain

- The worked rule change lost its explicit "ask if the author did not confirm"
  application; it now relies on the SKILL bullet alone.
- The SKILL map bullet now states the mechanical-map exclusion and the
  named-lookup rule in the core. This is moved wording, not new wording, but it
  is more prominent than before and could make runs add tone tables more often.
- Dropping the reference's "Input and Result are inferred, so a wrong row fails
  typecheck" relies on runs copying the example runner when no runner exists.
- The owner's bar items about `components/ui`, `features/<feature>` domain
  placement, and typed size/variant do not apply to this skill's content
  (tests only); "no repeated code" is served by the single runner and the
  removal of duplicated rules and snippets.
