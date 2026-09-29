# September 29 2026 feedback decisions

The three original reports are preserved unchanged, and each passes the
canonical validator:

- [Over-engineering judged against future development](../../.agents/feedback/build-composable-components/2026-09-29-over-engineering-judged-against-future-development.md)
- [Single-caller helpers and future reuse](../../.agents/feedback/extract-named-helpers/2026-09-29-single-caller-helpers-and-future-reuse.md)
- [Decision tables and change-detectors](../../.agents/feedback/write-feature-tests/2026-09-29-decision-tables-and-change-detectors.md)

## Source and evidence

All three reports target React Skills v1.12.0, which is the current source.
Every "current behavior" quote was compared with that source and found as
quoted: the "Do not force" line and workflow step 2 in
`build-composable-components`, its "two-component wrapper" and "future
requirement" lines, the "Do not extract" and Placement rules in
`extract-named-helpers`, and the Layer placement, "What fits a case table",
"One file per decision", and "Project policy boundaries" text in
`write-feature-tests`. The originating monorepo is unavailable. Its paths,
audit items, and the user's correction are reported evidence and were not
reproduced here.

## Shared design

One audit came out of one session, so the three reports share one boundary:

- The rules for creating code stay as they are: the smallest coherent family,
  the "Do not extract" rules, and no speculative exports.
- New text governs audits of existing code. A caller count is a signal, never
  the verdict. A recorded consumer (a roadmap, backlog, plan, design, sibling
  screen with the same shape, or another app that composes a published
  package) counts as evidence. Speculation, which has no record, still does
  not.
- Removal is limited to duplication, test-only indirection, change-detectors,
  and dead members. An export read only inside its own module is narrowed
  rather than deleted. With no record, the verdict is `revisit`, not removal.

Skills install independently, so each one that needs the words defines
"recorded consumer" itself in one sentence. The full decision test lives only
in `build-composable-components`.

## build-composable-components

| Finding | Decision | Destination | Reason | Validation |
| --- | --- | --- | --- | --- |
| F-001 | adapted | `SKILL.md` sentence after "Do not force"; "Judge over-engineering" in `review-and-testing.md` with the ordered decision test, Contents link, and an "Audit findings" bullet | Two changes from the proposal. First, the report also names "A two-component wrapper should stay simple" as a misread authority, so `architecture-and-api.md` gets the same create-versus-audit clause there. Second, the report's row 2 ("a variant or root prop in the family model") and row 5 ("a value with no caller") contradicted its own variant example (row 3) and its negative control (`revisit`). Row 2 now covers composed slots and parts, exported consumer hooks, and documented package members. Row 5 now covers pure forwarding, switches that only select omittable children, and members nothing reads. An unused variant value with no record falls to row 6 | Forward test (below), re-run after the row fix |
| F-002 | accepted | `SKILL.md` workflow step 2; vocabulary in "Judge over-engineering"; a sentence beside the "future requirement" rule in `architecture-and-api.md`; period-picker example | The existing rule against hoisting for a future requirement stays and now sits beside the speculation/record distinction | Forward test with and without a backlog |
| F-003 | accepted | Rows 1 and 5 of the decision test, "narrow before deleting", a contract checklist item for exported consumer hooks, and the repeated-UI rule | The ResourceTable module example is used as given | Forward test |

## extract-named-helpers

| Finding | Decision | Destination | Reason | Validation |
| --- | --- | --- | --- | --- |
| F-001 | accepted | `SKILL.md` closing sentence under "Do not extract"; "Auditing existing helpers" in `extraction-triggers.md` with keep and inline examples, the `getItemCount` counterexample, and the one-line fallback tension | Keeps the create rules unchanged and gives audits keep, inline, narrow, and `revisit` outcomes. After the forward test, three clarifications were added: `revisit` means report the helper and leave the code unchanged; the keep criteria decide whether a helper stays named, while export and location follow placement; and workflow step 1 reads planning artifacts when auditing | Forward test |
| F-002 | adapted | Placement table row and the sentence under it; recorded-consumer example and pricing counterexample in `placement.md` | `placement.md` already said not to move a helper from a lower layer into a feature. The change defines a speculative export, and from the report's negative control it adds that an existing lower-layer export with no record is `revisit`, not moved | Forward test with and without a backlog |
| F-003 | accepted | Placement row now reads "of the same concern", plus a sentence routing purpose placement to `$feature-sliced-design`; avoid/fine pair in `placement.md` | The "avoid" line uses the report's own `formatShortDate`/`formatLongDate` counterexample rather than `parse-date.ts`, because parsing and formatting could be read as two purposes | Forward test |

The description now names auditing existing helpers as a trigger. Domain type
aliases need no change; the report records that decision itself.

## write-feature-tests

| Finding | Decision | Destination | Reason | Validation |
| --- | --- | --- | --- | --- |
| F-001 | accepted | `SKILL.md` Case tables bullets; a Fits / Does-not-fit row, a map paragraph, and a Runner contract bullet in `case-tables.md`; typed example `status.ts` with `support-request-status-tone.test.ts` | The example uses the catalog's support-request domain instead of the report's ticket domain, so it joins the existing Vitest example | Example typechecks and its four rows run in Vitest; forward test |
| F-002 | accepted | `SKILL.md` "When a rule changes" bullet; new "Change-detectors" section with the product-choice check and the cover-then-delete order | Exclusions (product maps, defaults contract, snapshot policy) are kept | Forward test |
| F-003 | accepted | "One file per decision" now opens with reasons that hold without baked defaults and keeps failure locality as one of them; the "Project policy boundaries" bullet and `SKILL.md` decision defaults separate folder policy from decision granularity | A per-module policy written in the repository's own instructions is still followed, and the deviation is recorded | Forward test |
| F-004 | accepted | `SKILL.md` Layer placement sentence; the Fits row names business-agnostic libraries | Interaction tests stay routed to their owners | Forward test |

The description now names auditing feature tests as a trigger. Workflow step 9
states the report's cross-cutting removal list: duplicate suites, test-only
adapters, and change-detectors (after covering the behavior). It was added
because the forward test found audit guidance spread across bullets, with no
workflow step.

## Not changed

- `feature-sliced-design`: `already-covered`, which both related reports also
  record. Its purpose-named segments and `shared/i18n` defaults already
  support the locale-module boundary.
- `docs/technology-stack.md`: no stack, layer, or boundary change.
- Duplicate test suites: covered by row 1 of the component decision test. No
  separate `write-feature-tests` rule, as that report proposes.

## Verification and limits

- `npm run validate` passes. It covers adapter and registry sync, the quality
  contract, typecheck, the Node example suite, and Vitest. Vitest now runs
  four files and 14 tests, including the four-row status-tone table.
- The feedback validator passes for all three reports.
- Forward tests: a fresh agent was given only the changed skill files, plus
  each report's fresh-task prompt and negative control. Origin evidence and
  expected answers were withheld.
  - `write-feature-tests`: keeps the six decision files, the tone table, and
    the `toRangeEnd` table. It adds a reset behavior test before deleting the
    `CLEARED_FILTERS` assertion, and replaces the `includesOption` adapter with
    plain cases. This matches the report.
  - `extract-named-helpers`: with the backlog, it keeps both range helpers
    exported and cites the backlog, keeps the locale module, and inlines
    `isReady`. Without the backlog, the range helpers are `revisit`, not moved
    or inlined. This matches the report and its negative control.
  - `build-composable-components`: the first run gave the expected verdicts
    but reported the row 2 and row 5 contradiction described under F-001. A
    fresh re-run after the fix added an unset `layout` switch prop to the
    prompt. With the backlog: keep the variant (row 3, citing the backlog),
    keep `useTimelineContext` (row 2), remove the test-only wrapper and the
    duplicate suite (row 1), and remove `layout` (row 5). Without the
    backlog, the variant is `revisit` (row 6). This matches the report and its
    negative control.
- The re-run also reported that row 3 did not say whether a record must name
  the member or only the family, and that row 4 could be read to cover a style
  value. Both rows were clarified to match the verdicts the agent had already
  reached. No third run was made.
- The forward tests are single runs by one model on described scenarios. They
  are not repeated or statistical evaluations, and they are not audits of real
  code.
