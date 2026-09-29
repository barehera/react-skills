---
feedback_version: 1
target_skill: write-feature-tests
target_skill_version: 1.12.0
react_skills_release: React Skills v1.12.0
source_project: fepatex-monorepo (client-portal redesign)
captured_at: 2026-09-29
status: ready
---

# Skill Feedback: write-feature-tests

## Executive Summary

This report is for improving the `write-feature-tests` skill, not for editing
the originating product feature's tests.

An over-engineering audit proposed four test changes:

- merge about 48 one-per-decision rule-test files into about 14 per-module
  files;
- delete every case table for status→tone badge maps as "change-detectors";
- delete tables for business-agnostic library transforms as "outside the
  skill's scope";
- delete tests that compare a constant with its own literal.

The user kept the layout, the badge-map tables and the library tables. The
user accepted only the literal-restating deletions and the removal of one
test-only adapter.

The skill gives no guidance on four points: whether a constant map that
encodes a product decision is a case-table decision; what a change-detector
test is; why one file per decision matters beyond baked config defaults; and
whether its feature-adapter ownership statement forbids tables elsewhere. The
four findings below close those gaps.

## Project Context

- Task: audit the test suite of a redesigned customer portal for
  over-engineering after an earlier refactor had introduced the shared
  `testRule` runner and one file per decision.
- Stack and conventions: Vitest, React Testing Library, TypeScript, Zod, a
  monorepo with shared packages. One shared `testRule` runner lives in the
  shared package's test utilities. There are no baked remote-config defaults.
- Skill invocation: `write-feature-tests` (`SKILL.md`, `references/case-tables.md`)
  in audit mode, with build-composable-components, extract-named-helpers and
  feature-sliced-design. All skills are React Skills v1.12.0.
- Evidence reviewed: the audit's over-engineering items and reconsideration
  table; the user's verbatim correction; the accepted implementation
  handoffs; the earlier audit that introduced the layout; and the current test
  files.

## Findings

### F-001: A constant map that encodes a product decision keeps its case table

- Category: missing-rule
- Severity: medium
- Recurrence: repeated
- Confidence: high

#### Scenario

Several features map a domain status to a visual tone with a typed constant
(`as const satisfies Record<Status, Tone>`). Some mappings are product
choices that a reviewer could get wrong, for example "an expired offer reads
as closed, in the same red as a declined one". Each map had its own case
table. The audit proposed deleting all of them.

#### Evidence

origin (do not ingest):

- `frontend/apps/client-portal/features/offers/components/__tests__/offer-status-badge-variant.test.ts`:

  ```ts
  function offerStatusBadgeVariant(status: OfferStatus) {
    return OFFER_STATUS_BADGE_VARIANT[status];
  }
  testRule(offerStatusBadgeVariant, [
    { case: "an expired offer can no longer be accepted", input: "EXPIRED", expected: "destructive-soft" },
    // ...
  ]);
  ```

- Audit proposal O2, `handoffs/client-portal-redesign/react-skills-audit-2.md:150-155`:
  "The maps are already typed `Record<Status, …>` … so a missing status fails
  typecheck … **Fix:** delete all 7 files."
- Accepted, `react-skills-audit-2.md:408`: "O2 badge-map tables | delete |
  **KEEP** | status→tone is a product decision; typecheck catches missing keys,
  not a wrong tone".
- Contrast, which was accepted as a removal: O7 "**PARTIAL** keep `isOneOf`
  (generic guard); remove only the test-only adapter"
  (`react-skills-audit-2.md:414`). It was implemented in `refactor-batch-G2.md`,
  O7 row: "no longer wraps it in a second function with the same name just to
  fit `testRule`. It is now three plain `it` cases … because a positional type
  guard is not an `input -> result` case-table decision."

#### Current behavior

The agent treated a typed map as proven by the type system and called its
table a change-detector. The skill's "What fits a case table" lists pure
predicates, Zod transforms and store transitions, but it does not mention
constant maps. It says nothing about the difference between key coverage
(which the type system proves) and value correctness (which it does not).

#### Preferred behavior

A constant lookup map whose values are product choices is a pure
`input -> result` decision and gets one case table. Row names state the
product reason. `satisfies Record<K, V>` proves that every key exists. It
does not prove that a key maps to the right value.

The table may pass a named lookup declared in the test that only indexes the
map. Such a lookup does not change the map's input shape. By contrast, wrapping
an existing function in a same-named adapter that changes its signature to fit
the runner is bending the runner. Test such a function with plain cases
instead.

#### Proposed skill change

- `references/case-tables.md` "What fits a case table": add the row "A
  constant lookup map whose values are product choices (status → tone,
  plan → limit)" to the Fits column. Add the row "A multi-argument or
  positional guard that would need a reshaping adapter" to the Does-not-fit
  column.
- `references/case-tables.md` "Runner contract": add two sentences. "For a
  map, pass a named lookup declared in the test that only indexes the map. Do
  not wrap an existing function in an adapter that changes its arguments; test
  it with plain cases."
- `SKILL.md` "Case tables": add one bullet. "Type coverage of a map's keys is
  not a test of its values; a product-chosen map keeps its table."

skill example (ingest this):

```ts
// Production: every key is typed; the values are product choices.
export const TICKET_PRIORITY_TONE = {
  LOW: "neutral",
  HIGH: "warning",
  BREACHED: "danger",
} as const satisfies Record<TicketPriority, Tone>

// Test: a named lookup that only indexes the map.
function ticketPriorityTone(priority: TicketPriority) {
  return TICKET_PRIORITY_TONE[priority]
}

testRule(ticketPriorityTone, [
  { case: "a routine ticket stays neutral", input: "LOW", expected: "neutral" },
  { case: "a breached SLA reads as danger", input: "BREACHED", expected: "danger" },
])

// Not a case table: includesOption(options, value) is a positional guard.
// Do not write `function includesOption({ options, value }) { ... }` in the test
// only so it fits the runner. Use plain it(...) cases instead.
```

#### Generalization test

Applies to maps whose values a product owner chooses (tones, limits, labels
keyed by a rule, routing targets). Does not apply to maps whose values are
mechanical, such as a map from an enum to its own string or an i18n key that
equals the enum name. Those maps restate their keys and need no table.
Counterexample: `STATUS_TO_KEY = { OPEN: "OPEN", CLOSED: "CLOSED" }` gets no
table.

#### Acceptance criteria

- `case-tables.md` lists product-chosen constant maps under "Fits" and
  reshaping adapters for positional guards under "Does not fit".
- The skill states that `satisfies Record<K, V>` proves key coverage, not
  value correctness.
- On a fresh audit, an agent keeps a status→tone table whose rows state
  product reasons. It removes a same-named adapter that exists only to reshape
  a positional guard for the runner.

### F-002: Delete a test that asserts a constant equals its own literal

- Category: missing-rule
- Severity: low
- Recurrence: repeated
- Confidence: high

#### Scenario

Two list tests asserted that a "cleared filters" constant equalled an object
literal copied from its declaration. The behaviour that the constant supports
("reset clears every filter but keeps the sort") was tested through the
rendered table for one list, but not for the other.

#### Evidence

origin (do not ingest):

- Audit O13, `react-skills-audit-2.md:238-241`:
  "`__tests__/offer-list.test.tsx:90-100` and
  `__tests__/dossier-list.test.tsx:13-17` assert that a constant equals its
  own literal."
- Accepted, `react-skills-audit-2.md:419`: "O13 `CLEARED_*` change-detector
  tests | delete | **REMOVE** | asserts a constant equals itself". The
  accepted principle lists "a test that asserts a constant equals its own
  literal" as a removal criterion (`:402`).
- Implemented, `refactor-batch-G2.md` O13 row: "Offers already covered 'resets
  every filter and keeps the sort' through the table. Dossiers did not, so
  `__tests__/dossiers-table.test.tsx` gained that same test through the table
  and the URL."

#### Current behavior

The skill does not define change-detector tests. The agent had to invent the
boundary. At first it drew the boundary too wide (see F-001: it called the
product-map tables change-detectors) and then corrected it.

#### Preferred behavior

A change-detector test copies its expected value from the implementation
without stating a product reason, so it fails on every edit, including correct
ones. Delete it. If the behaviour the constant supports is not yet tested
through its consumer, first add that behaviour test (a case table or an
interaction test), then delete the change-detector. Before deleting, apply
F-001's product-choice check: would a reviewer call a row wrong for a product
reason, independently of the code? If yes, the row is a decision, not a
change-detector.

#### Proposed skill change

- `references/case-tables.md`: add a short section "Change-detectors",
  containing the definition, the product-choice check, and the "cover the
  behaviour first, then delete" order.
- `SKILL.md` "When a rule changes": add the bullet "A test that only restates
  a constant's literal is not a rule test. Replace it with a behaviour test
  where the behaviour is untested, then delete it."

skill example (ingest this):

```ts
// Change-detector: the expected value is copied from the declaration.
it("clears filters", () => {
  expect(CLEARED_TICKET_FILTERS).toEqual({ search: null, status: null, page: null })
})

// Behaviour: the rule the constant exists for.
testRule(toResetTicketFilters, [
  {
    case: "reset clears every filter and keeps the sort",
    input: { search: "x", status: "OPEN", page: 3, sort: "createdAt" },
    expected: { search: null, status: null, page: null, sort: "createdAt" },
  },
])
```

#### Generalization test

Applies to any assertion whose expected value is the literal of the constant
under test. Does not apply to product-chosen maps (F-001), baked config
defaults (the skill's defaults contract), or snapshot tests the repository
adopted as policy. Counterexample: a defaults-contract test that compares
schema keys with default keys is not a change-detector. It catches drift
between two artifacts.

#### Acceptance criteria

- `case-tables.md` defines a change-detector and gives the product-choice
  check that separates it from a decision table.
- The guidance says to cover the constant's behaviour before deleting a
  change-detector.
- On a fresh audit, an agent deletes a constant-equals-literal test only
  after it confirms or adds a behaviour test for the reset rule.

### F-003: Keep one file per decision; do not merge files only to reduce file count

- Category: ambiguous-rule
- Severity: medium
- Recurrence: structural
- Confidence: high

#### Scenario

An earlier refactor split each pure decision's table into its own test file,
named for the decision. There were about 48 files across the date library,
feature utilities, list filters, selection helpers and route matchers. The
over-engineering audit proposed merging them into one test file per production
module, about 14 files. It argued that the skill's reason for one file per
decision applies only to baked config defaults, and that "test folder
naming and grouping inside a feature" is project policy.

#### Evidence

origin (do not ingest):

- The earlier split, `handoffs/client-portal-redesign/react-skills-audit.md`
  M19: "`offer-list.test.tsx` and `dossier-list.test.tsx` mix pure-decision
  suites with component renders. Split them into one file per decision beside
  the feature."
- Current layout, for example
  `frontend/apps/client-portal/features/wishlist/__tests__/`:
  `can-add-wishlist-item-to-cart.test.ts`, `can-undo-wishlist-removal.test.ts`,
  `count-blocked-wishlist-items.test.ts`, … (9 decision files).
- Audit proposal O1, `react-skills-audit-2.md:138-148`: "The skill's reason
  for one file per decision is to keep a broken baked config default local.
  There are no baked defaults here. The skill leaves the test folder layout
  to the project … Result: about 48 → 14 files."
- Accepted, `react-skills-audit-2.md:407` and `:426`: "O1 one test file per
  decision | merge | **KEEP** | `write-feature-tests` convention: a new rule
  adds a file or rows, so it scales with features". Also "Batch J (test
  layout) | run | **DROPPED**".

#### Current behavior

The skill's only stated rationale for one file per decision ("One file per
decision" in `case-tables.md`) is failure locality for default-dependent
tables. Its "Project policy boundaries" section calls "the test folder naming
and grouping inside a feature" project policy. The agent combined the two
statements and concluded that the layout is optional wherever there are no
baked defaults, and that merging files is a simplification.

#### Preferred behavior

One file per decision is the skill's default layout, for reasons that hold
without baked defaults:

- a new rule adds a file, or rows in its file, and never edits a neighbour's
  file;
- a decision is found by its file name;
- a red file name names the broken rule;
- history and review diffs stay per decision;
- a collection failure in one file stays local.

"Project policy" covers folder naming (for example `tests/unit` or
`__tests__`) and grouping folders. It does not cover collapsing decisions
into per-module files. Reducing the file count is not a reason to merge.

#### Proposed skill change

- `references/case-tables.md` "One file per decision": open with the general
  rationale above. Keep the baked-default failure-locality paragraph as one
  of the reasons, not the only one.
- `references/case-tables.md` "Project policy boundaries": change the first
  bullet to "the test folder name and location inside a feature, such as
  `tests/unit` or `__tests__` (not the one-file-per-decision granularity)".
- `SKILL.md` "Decision defaults": extend "Test file: one per decision, named
  for the decision, beside its feature" with "; do not merge decision files
  to reduce file count".

skill example (ingest this):

```text
Keep (one file per decision; a new rule adds a file):
  tickets/tests/unit/can-reopen-ticket.test.ts
  tickets/tests/unit/get-ticket-priority-tone.test.ts
  tickets/tests/unit/has-breached-sla.test.ts

Avoid (merged only to reduce file count):
  tickets/tests/unit/ticket-rules.test.ts   // three testRule calls in one file
```

#### Generalization test

Applies to case-table tests of pure decisions in any repository that uses the
skill's runner. Does not govern interaction, contract or end-to-end tests,
which follow their owning skill and the repository's layout. Counterexample:
if a repository documents a per-module test policy in its own instructions,
the agent follows it and records the deviation. It does not introduce the
merge itself on the grounds that the result is simpler.

#### Acceptance criteria

- `case-tables.md` "One file per decision" states reasons that apply without
  baked defaults, and keeps failure locality as one reason among them.
- "Project policy boundaries" says that folder naming is project policy, and
  that decision granularity is not.
- On a fresh audit of a suite with one file per decision and no config
  defaults, the agent does not propose merging the files.

### F-004: Ownership of feature-adapter tests does not forbid tables for shared pure transforms

- Category: ambiguous-rule
- Severity: low
- Recurrence: once
- Confidence: medium

#### Scenario

Some case tables cover pure transforms in business-agnostic libraries: date
parsing and day bounds, row-selection transforms, route matchers, and a
quantity formatter in a shared package. The audit argued that these tables
fall outside the skill's scope and should be merged or deleted.

#### Evidence

origin (do not ingest):

- Audit rationale, `react-skills-audit-2.md:38`: "write-feature-tests owns
  *feature-adapter product rules* … Tables for generic `lib/` and family
  helpers … are out of the skill's scope". O1: "Several tables cover `lib/`
  and family helpers, which are outside write-feature-tests' scope".
- Accepted: O1 and O3 **KEEP** (`react-skills-audit-2.md:407`, `:409`). The
  library tables remain, for example `frontend/apps/client-portal/lib/__tests__/`
  `to-day-start-date-time.test.ts`, `is-after-day.test.ts` and
  `with-selected-rows.test.ts`.
- The accepted implementation added new tables for shared-package transforms:
  `packages/shared/src/features/products/lib/__tests__/format-sales-unit.test.ts`
  (`refactor-batch-G2.md` Decisions) and
  `packages/shared/src/features/users/lib/__tests__/get-me-permissions.test.ts`
  (`refactor-batch-H2.md` Tests).

#### Current behavior

The skill's "Layer placement" says it "owns tests for the feature adapter"
and that "Primitive and family behavior tests belong to"
`$build-composable-components` and `$build-forms`. The agent read that
ownership statement as a prohibition on case tables for pure functions in
shared libraries.

#### Preferred behavior

The ownership statement routes *interaction* tests for primitives and
families to their skills. A pure `input -> result` transform in a
business-agnostic library may use the same runner and the same
one-file-per-decision layout. The shared runner itself stays free of feature
imports, as today.

#### Proposed skill change

- `SKILL.md` "Layer placement": add one sentence. "A pure `input -> result`
  transform in a business-agnostic library may use the same runner and
  layout; this ownership statement routes primitive and family interaction
  tests elsewhere, it does not forbid tables for pure library transforms."

skill example (ingest this):

```ts
// A business-agnostic transform in a shared date library: a case table is fine.
testRule(toRangeEnd, [
  { case: "ends at the last millisecond of the day", input: "2026-01-31", expected: "2026-01-31T23:59:59.999" },
])
```

#### Generalization test

Applies to pure functions in shared or library modules. Does not bring
component rendering, focus or keyboard behaviour into this skill.
Counterexample: a data-table sorting interaction (clicking a header) stays an
interaction test owned by the component skill, even though the underlying
sort-key resolver may have its own table.

#### Acceptance criteria

- "Layer placement" states that pure library transforms may use the runner,
  and that the ownership statement routes interaction tests.
- On a fresh audit, an agent does not delete or merge a case table only
  because its function lives in a shared library.

## Cross-Cutting Decisions

- Product-choice check (shared by F-001 and F-002): would a reviewer call a
  row wrong for a product reason, independently of the code? If yes, the row
  is a decision. If the expected value is only copied from the declaration,
  the test is a change-detector.
- Removal in this skill's area is limited to the accepted list: duplicate
  suites, test-only adapters, and constant-equals-literal tests. The
  duplicate-suite removal (O5) needs no new rule. The skill already implies
  one table per decision, and build-composable-components' report covers
  duplication in audits.
- "Test-only adapter" means reshaping an existing function's arguments to fit
  the runner. A named lookup that only indexes a map is not a test-only
  adapter.
- Related reports:
  `.agents/feedback/build-composable-components/2026-09-29-over-engineering-judged-against-future-development.md`
  and
  `.agents/feedback/extract-named-helpers/2026-09-29-single-caller-helpers-and-future-reuse.md`.

## Validation Requested

- Edit `SKILL.md` (a "Case tables" bullet, a "When a rule changes" bullet,
  "Layer placement" and "Decision defaults") and `references/case-tables.md`
  ("What fits a case table" rows, "Runner contract" sentences, a new
  "Change-detectors" section, the "One file per decision" rationale, and the
  "Project policy boundaries" wording). Consider adding a map-table example
  under the skill's `examples/rule-tests`. Then run the React Skills catalog
  validation, typecheck the examples, and run this feedback validator.
- Fresh-task prompt: "Review the tests of a helpdesk app for
  over-engineering. `tickets/tests/unit/` has one file per rule (six files). A
  `ticket-priority-tone.test.ts` tables a typed `Record<Priority, Tone>` map
  with product-worded rows. `filters.test.ts` has
  `expect(CLEARED_FILTERS).toEqual({...})`, and no test covers the reset
  behaviour. `lib/tests/` tables `toRangeEnd`. One test wraps
  `includesOption(options, value)` in a same-named one-object function to call
  `testRule`. Recommend changes." Expected: keep the six files, the tone table
  and the `toRangeEnd` table. Add a reset behaviour test, then delete the
  `CLEARED_FILTERS` assertion. Replace the `includesOption` adapter with plain cases.
