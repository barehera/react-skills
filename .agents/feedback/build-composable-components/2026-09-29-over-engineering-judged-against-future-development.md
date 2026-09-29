---
feedback_version: 1
target_skill: build-composable-components
target_skill_version: 1.12.0
react_skills_release: React Skills v1.12.0
source_project: fepatex-monorepo (client-portal redesign)
captured_at: 2026-09-29
status: ready
---

# Skill Feedback: build-composable-components

## Executive Summary

This report is for improving the `build-composable-components` skill, not for
editing the originating product feature.

An over-engineering audit used the skill's "do not force compound components,
context… onto a project with a simpler coherent solution" line and "a
two-component wrapper should stay simple" as a licence to collapse any family
part, slot, variant or domain adapter with zero or one current caller. The
user rejected most of those proposals. The project keeps composable families on
purpose, so that new features are built from existing parts. The accepted
outcome kept every abstraction that is a documented extension point, has a
recorded upcoming consumer, or keeps new features composable. It removed only
duplication, test-only indirection, change-detector tests and repeated
comments.

The skill tells an agent to infer likely extensions when it *creates* a family.
It gives an *auditor* no balancing criterion. The proposed change adds a
per-abstraction decision test to the audit guidance. The test separates
evidence of over-engineering from a low caller count, and it separates a
recorded future consumer from speculation.

## Project Context

- Task: audit a redesigned list-heavy customer portal (five list pages, a
  shared data-table family, a filter-bar family, a date-range picker family,
  status badges, a shell package) for over-engineering after earlier refactor
  batches had added structure.
- Stack and conventions: React 19, Next.js 16 App Router, shadcn primitives in
  a shared UI package, TanStack Table and Query, nuqs, next-intl. React
  Compiler is off. The user prefers additive variants and composable families
  that later features reuse.
- Skill invocation: `build-composable-components` in audit mode
  (`references/review-and-testing.md`, `references/architecture-and-api.md`),
  alongside extract-named-helpers, write-feature-tests and
  feature-sliced-design. All skills are React Skills v1.12.0.
- Evidence reviewed: the audit's over-engineering section and its
  reconsideration table; the user's verbatim correction; the two accepted
  implementation handoffs; the backend-requests roadmap listing planned
  filters, pages and columns; the earlier audit whose batches added the
  structure; and the current source of the kept parts.

## Findings

### F-001: Caller count alone is not evidence of over-engineering

- Category: ambiguous-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

An auditor reviewed a codebase whose families had been extended during a
redesign. Several parts had one current caller, or none: a sub-row `variant`
whose default value was unused, a date-range compound family whose only
consumer never passed children, a header `Actions` slot with no caller yet,
one-line status-badge adapters over a generic badge, and a feature filter-bar
component over a generic filter-bar family. The repository keeps these
families deliberately as the base for upcoming pages.

#### Evidence

origin (do not ingest):

- The audit's stated removal test, in
  `handoffs/client-portal-redesign/react-skills-audit-2.md:37`: "**Remove** a
  part, prop, variant or file when it has 0 or 1 callers and no consumer
  composes it differently, or when it only forwards values." It quotes the
  skill: "A two-component wrapper should stay simple" and "Do not force
  compound components, context… onto a project with a simpler coherent
  solution."
- Proposals built on that test, in the same file: O4 drop the
  `DataTableSubRow` variant ("The default `"attached"` has **0** callers"),
  O6 collapse the `DateRangePicker` family ("Re-open the family only when a
  second consumer needs a different arrangement"), O8 inline
  `DossierFilterBar`, O10 inline the status-badge adapters, O12 delete
  `PageHeaderActions`, O14 inline wrapper parts, O16 remove the shell's
  exported nav parts.
- The user's correction (2026-09-29), verbatim: "reconsider this for
  overenginner we have compoasable components and extract helpers skill to
  maintain the project and adding new features with already existed
  components and helpers hooks etc. While deciding the overengineering part
  consider future development efforts and features that might we can develop
  on top of what we have".
- Accepted outcome, `react-skills-audit-2.md:391-426`: O4, O6, O8, O10, O12,
  O14 and O16 were flipped to **KEEP**, for example "O4 … order lines,
  add-ons and invoice lines are likely sub-row consumers" and "O8 … the
  feature filter-bar component is the pattern the next filterable lists
  follow".
- The accepted batches left those parts alone:
  `handoffs/client-portal-redesign/frontend/refactor-batch-G2.md:5` ("The
  findings marked KEEP there (O4, O8, O10, O14 …) were left alone").

#### Current behavior

In audit mode, the agent treated "0 or 1 callers" as sufficient evidence to
collapse a family part, slot, variant or domain adapter. It cited the skill's
"do not force" and "two-component wrapper" lines as authority. It did not ask
whether the abstraction was an extension point, or whether the product had
recorded upcoming consumers. The skill's audit reference
(`review-and-testing.md`) has no over-engineering criteria. The only balancing
text, "infer likely extensions from concrete product requirements" (workflow
step 2) and "Which API additions are likely" (family model question 6), is
framed as design-time guidance, not audit guidance.

#### Preferred behavior

In an audit, count callers only as a signal. Before recommending removal of
a family part, slot, variant, root prop or domain adapter, apply a
per-abstraction decision test (F-002 and F-003 define its keep and remove
criteria). The "do not force" line guards against *introducing* heavy
machinery where the repository has a simpler coherent solution. It does not
permit dismantling a family the repository chose to maintain. Report each
abstraction as `keep`, `remove` or `revisit`, with the criterion that decided
it.

#### Proposed skill change

- `SKILL.md`, directly after "Do not force compound components, context,
  Zustand, CVA…": add one sentence. "In an audit, this line does not permit
  removing an existing part: judge each abstraction with the over-engineering
  decision test in `review-and-testing.md`, where a low caller count is a
  signal, never the verdict."
- `references/review-and-testing.md`: add a section "Judge over-engineering",
  linked from Contents and from "Audit findings". It holds the ordered
  decision test below and requires that each audit finding name the criterion
  it applied.
- `references/review-and-testing.md` "Audit findings": add the bullet "for
  each proposed removal, state which removal criterion applies and confirm
  that no keep criterion applies".

skill example (ingest this):

```text
Over-engineering decision test. Apply it to each part, slot, variant, root prop,
domain adapter or exported family member. The first matching row decides.

1. Duplicate or test-only?     A copy of another part, a second suite for the
                               same behaviour, or an export or wrapper that
                               exists only so a test can reach code -> REMOVE
2. Extension point?            A slot, part, variant or root prop in the family
                               model, or a public part of a package that other
                               apps compose -> KEEP
3. Recorded consumer?          A roadmap, backlog, plan or sibling screen with
                               the same shape names a consumer -> KEEP (cite it)
4. Keeps features composable?  A new screen can be assembled from it instead
                               of copying markup or re-deriving a binding -> KEEP
5. Dead?                       Forwards props unchanged, or is a prop or value
                               with no caller, and rows 2-4 do not apply
                               -> REMOVE
6. Otherwise                   -> REVISIT: report it; do not remove it on caller
                               count alone
```

```tsx
// Audit input: ResourceTable.SubRow has variant "attached" | "inset"; only
// "inset" is used today. The backlog lists two more tables with nested
// detail rows.
// Previous verdict: "0 callers for 'attached' -> drop the variant prop."
// Improved verdict: row 3 (recorded consumer) -> KEEP; cite the backlog item.
<ResourceTableSubRow variant="inset">{children}</ResourceTableSubRow>
```

#### Generalization test

Applies to audits and refactors of an existing component family in any
repository that maintains families for reuse. It does not apply when the task
creates a new family. There, the existing rule stands: build "the smallest
coherent family" and do not hoist an array "merely because a future
requirement might need those behaviors". It also does not protect a part that
fails every keep criterion. Counterexample: a `mode` root prop that no
consumer sets, no plan mentions, and that only selects children the consumer
could omit is still removed under row 5.

#### Acceptance criteria

- `review-and-testing.md` contains an ordered over-engineering decision test
  whose keep criteria come before the "dead" criterion. Its text says a caller
  count is a signal, not a verdict.
- `SKILL.md` states that the "do not force" line governs introducing
  machinery, not removing an existing part during an audit, and routes to the
  decision test.
- On a fresh audit, an agent given a family variant with zero current users
  and a backlog item for a second consumer recommends keeping the variant and
  cites the backlog item.

### F-002: A recorded upcoming consumer or extension point justifies keeping a part

- Category: missing-rule
- Severity: high
- Recurrence: repeated
- Confidence: high

#### Scenario

The same audit had a written roadmap for the product. It listed period and
status filters for two more lists, a new paginated list page, a new messages
page, an owner column and price columns. It also had a shared shell package
that other portals compose, and a design showing page-level actions in the
header. The auditor did not treat any of these as evidence.

#### Evidence

origin (do not ingest):

- Roadmap: `docs/plans/client-portal/portal-redesign/03_BACKEND_REQUESTS.md`
  §2 "Orders list" requests "`createdAfter`, `createdBefore` … same names as
  the offer list" and "`orderStatus`". §4 "Invoices overview (new)" requests
  "`GET /v1/registered/invoices`, paginated" with "`createdAfter` /
  `createdBefore`, `paymentStatus`". §5 requests a dossiers "Period filter".
- The accepted reasons cite that record: O6 "reused by upcoming period
  filters; the family allows presets and reordering". O4 "order lines,
  add-ons and invoice lines are likely sub-row consumers". O12 "the design
  puts page actions in the header (e.g. 'New wishlist'); planned slot". O16
  "sensey is the shell package other portals compose". O10 "domain adapters
  over `StatusBadge`; reusable on detail pages"
  (`react-skills-audit-2.md:410-422`).
- The kept family, `frontend/apps/client-portal/components/date-range-picker.tsx:26`
  (`DateRangePickerContext`), `:168-191` (`DateRangePickerFrom`,
  `DateRangePickerTo`, `DateRangePickerSeparator`), with one current consumer.
- The accepted implementation shows the payoff: a future list page composed
  only from existing parts, `refactor-batch-G2.md` "How a new list page
  composes these" (an invoices list built from `DataTable*`, `FilterBar*` and
  `FilterBarOptionSelect`, with no new family code).

#### Current behavior

The agent treated a future consumer as speculation unless it already existed
in code ("Re-open the family only when a second consumer needs a different
arrangement"). It also counted callers inside one app for a part that a
published package exports to other apps.

#### Preferred behavior

Treat these as keep evidence, and cite the record in the finding:

- A consumer named in a roadmap, backlog, plan, design or ticket.
- A sibling screen that already exists with the same shape.
- A public part of a package that other apps compose, where the caller
  population is every consuming app, not the audited one.

Speculation remains "might be useful some day", with no record. Keep the
existing rule against building for speculation when creating a family.

#### Proposed skill change

- `references/review-and-testing.md`, new "Judge over-engineering" section
  (shared with F-001): define "recorded consumer" as above, and require the
  audit to read available planning artifacts (roadmap, backlog, plan, design)
  before it judges any abstraction.
- `references/architecture-and-api.md`, under "Design complete composition
  boundaries", after "Do not hoist an array to the root merely because a
  future requirement might need those behaviors": add one sentence that
  separates speculation from a recorded consumer, and routes audits to the
  decision test.
- `SKILL.md` "Required workflow" step 2: extend "infer likely extensions from
  concrete product requirements" with "(roadmaps, backlogs, plans and sibling
  screens count as concrete requirements, in both create and audit mode)".

skill example (ingest this):

```tsx
// A period picker family with one consumer today. A backlog item adds period
// filters to two more lists. One of them needs presets between the bounds.
// Keep the open parts, so the next consumer composes instead of forking:
<PeriodPicker value={period} onValueChange={setPeriod}>
  <PeriodPickerFrom />
  <PeriodPickerPresets />   {/* the second consumer inserts this; no family edit */}
  <PeriodPickerSeparator />
  <PeriodPickerTo />
</PeriodPicker>

// Speculation (still rejected): "someone might want a third bound one day"
// with no backlog item -> do not add PeriodPickerThirdBound.
```

#### Generalization test

Applies when the repository or the user supplies a planning artifact, or a
sibling screen with the same shape exists. Also applies to parts that a
package publishes to other apps. Does not apply to an idea with no record. The
agent must not invent a roadmap. When no planning artifact is available, the
part falls to row 4 or row 6 of the decision test, not to automatic removal.
Counterexample: a `collapsedLogo` shell prop that no app sets and no plan
mentions. It is kept only if the package documents it as an extension point
for other apps. Otherwise it is `revisit`.

#### Acceptance criteria

- The skill defines "recorded consumer" with at least these sources: roadmap
  or backlog, plan or design, a sibling screen with the same shape, and
  consumers of a published package in other apps.
- The existing rule against hoisting for a "future requirement" remains, and
  now sits next to a sentence that separates speculation from a recorded
  consumer.
- On a fresh audit whose prompt includes a backlog that names a second
  consumer, the agent's keep verdict cites that backlog item. With the same
  code and no backlog, the verdict is `revisit`, not `remove`.

### F-003: Remove only duplication, test-only indirection, change-detectors and dead props

- Category: missing-rule
- Severity: medium
- Recurrence: repeated
- Confidence: high

#### Scenario

After the user's correction, the auditor still had to remove real waste.
Examples were a second test suite for the same family behaviour, a
same-named wrapper written only to fit a test runner, the same explanatory
sentence copied into five modules, and exports that were only read inside
their own file. The accepted outcome drew a precise removal boundary, and it
was narrower than the audit's first pass.

#### Evidence

origin (do not ingest):

- The accepted removal list, `react-skills-audit-2.md:399-403`: "It is
  **removed** only when it is: duplicated code or tests; indirection that
  exists solely to satisfy a test; a test that asserts a constant equals its
  own literal; a repeated comment."
- Applied, `react-skills-audit-2.md:411-424`: O5 "**REMOVE** pure
  duplication". O7 "**PARTIAL** keep `isOneOf` (generic guard); remove only
  the test-only adapter". O18 "**PARTIAL** keep `useDataTable` (hook for
  consumer-built parts) … un-export `getWishlistAddOnNoteId` only".
- Implemented, `refactor-batch-G2.md` O5 row: "The density suite exists once".
  `refactor-batch-H2.md` O18 row: "`getWishlistAddOnNoteId` is no longer
  exported. Its two users are in the same file."
- Repeated UI became family parts, not closed wrappers. R1–R11 were marked
  "**DO ALL** adds reusable parts future pages compose". Examples are
  `FilterBarOptionSelect`, `createDataTableActionsColumn` and
  `DataTableDateValue` (`refactor-batch-G2.md` "New parts: APIs").

#### Current behavior

The agent's removal list mixed real waste (duplicate suites, repeated
comments) with extension points (a family hook that consumers use to build
parts, a variant, a slot). It used one caller-count test for both groups, so
the audit proposed removals the user then had to reverse one by one.

#### Preferred behavior

Recommend removal only for:

- a duplicate part or test suite;
- a wrapper, adapter or export that exists only so a test can reach code;
- a test that asserts a constant equals its own literal;
- the same comment repeated across modules;
- a dead member: a prop, value or export with no caller, no in-family use and
  no recorded consumer.

An export whose only readers are in its own file is narrowed (un-exported),
not deleted. An exported hook or part that lets consumers build their own
parts is an extension point and stays. When the audit finds repeated UI, the
fix adds a part to the existing family that the next screen can compose. It
does not add a closed wrapper around the family.

#### Proposed skill change

- `references/review-and-testing.md`, "Judge over-engineering": list the
  removal criteria above as rows 1 and 5 of the decision test (F-001). Add the
  note: "narrow before deleting: un-export a member whose readers are all in
  its own module".
- `references/review-and-testing.md` "Contract checklist": add "A consumer
  hook or context accessor that is exported so consumers can build their own
  parts is an extension point, not a dead export."

skill example (ingest this):

```ts
// Audit of a ResourceTable family module.

// REMOVE (row 1): exported only so a test can reach it; no component uses it.
export function __resourceTableRowsForTest() { /* ... */ }

// NARROW (row 5): every reader is in this module -> drop `export`, keep the function.
export function getResourceRowNoteId(rowId: string) { return `${rowId}-note` }

// KEEP (row 2): consumers call it to build custom cells inside the family.
export function useResourceTable() { /* reads the family context */ }
```

#### Generalization test

Applies to audits and cleanup refactors of families, family helpers and
their tests. Does not permit deleting a public package member used by other
apps, and it does not replace F-002's keep criteria. Counterexample: an
exported convenience part used by one screen, which other screens are
recorded to adopt, stays under row 3 even though it forwards props.

#### Acceptance criteria

- The skill's audit guidance lists the removal criteria as a closed list and
  says "narrow before deleting" for exports read only inside their own module.
- The contract checklist names an exported consumer hook or context accessor
  as an extension point.
- On a fresh audit, an agent given one duplicate test suite, one test-only
  export and one exported consumer hook with no current external caller
  removes the first two and keeps the third.

## Cross-Cutting Decisions

- The user's intent is authoritative for this repository: the project keeps
  composable families and extracted helpers so new features are built from
  existing parts. Whether this should be the skill default for every
  repository is judged here. The decision test reaches this user's outcome
  without assuming it everywhere: in a repository with no planning artifacts
  and no published packages, parts fall to rows 4–6, not to automatic
  removal.
- One decision test serves both directions of an audit: *adding* a part for
  repeated UI and *removing* a part. The first audit used a symmetric
  caller-count rule for both ("Add a part only when … it has 2 or more real
  callers"). The accepted outcome replaced it with composability and recorded
  consumers.
- Vocabulary: "extension point", "recorded consumer", "speculation",
  "revisit". Use these words consistently across `SKILL.md` and
  `review-and-testing.md`.
- Related reports from the same session:
  `.agents/feedback/extract-named-helpers/2026-09-29-single-caller-helpers-and-future-reuse.md`
  and
  `.agents/feedback/write-feature-tests/2026-09-29-decision-tables-and-change-detectors.md`.
- feature-sliced-design needs no report. See the extract-named-helpers report,
  Cross-Cutting Decisions.

## Validation Requested

- Edit `SKILL.md` (one sentence after the "Do not force" line; workflow step 2
  wording), `references/review-and-testing.md` (new "Judge over-engineering"
  section, Contents link, "Audit findings" bullet, checklist item) and
  `references/architecture-and-api.md` (one sentence beside the "future
  requirement" rule). Then run the React Skills catalog validation and this
  feedback validator.
- Fresh-task prompt: "Audit this component library for over-engineering. It
  has a `Timeline` compound family with `TimelineItem`, `TimelineConnector`
  and a `variant` of `"dense" | "spacious"`. Only `"dense"` is used, by one
  activity screen. `backlog.md` lists a project history screen and an audit
  log screen that both show timelines. The family also exports
  `useTimelineContext`, which no screen imports yet, and a
  `TimelineItemForTest` wrapper that only a test imports. There is also a
  second test file that repeats the density tests. Recommend what to keep and
  what to remove." Expected: keep the variant and the family (row 3, citing
  the backlog). Keep `useTimelineContext` (row 2). Remove
  `TimelineItemForTest` and the duplicate suite (row 1). Each verdict names
  its criterion.
- Negative control: the same prompt without `backlog.md`. Expected: the
  variant is `revisit`, not `remove`.
