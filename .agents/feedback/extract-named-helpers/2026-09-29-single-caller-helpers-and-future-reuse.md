---
feedback_version: 1
target_skill: extract-named-helpers
target_skill_version: 1.12.0
react_skills_release: React Skills v1.12.0
source_project: fepatex-monorepo (client-portal redesign)
captured_at: 2026-09-29
status: ready
---

# Skill Feedback: extract-named-helpers

## Executive Summary

This report is for improving the `extract-named-helpers` skill, not for
editing the originating product feature.

In an over-engineering audit, the agent read the skill's guidance as a mandate
to shrink existing helpers. The lines it relied on were "Do not extract … one
caller", "a single-module caller gets a module-private helper", and "Never by
default: speculative exports … one file per tiny helper". It proposed three
changes. First, make single-caller date helpers private to their one feature
again, although a written roadmap lists three more features that need them.
Second, merge a one-function locale module into the date-formatting module.
Third, drop named domain type aliases. The user rejected all three. Named
helpers that encode a product rule or a reusable transform stay named and stay
where planned features can reach them. Only restatements and members with no
domain meaning are inlined or narrowed.

The skill's rules are written for *creating* an extraction. They give no
criterion for *auditing* an existing helper, and they do not say what makes an
export "speculative". The three findings below close those gaps.

## Project Context

- Task: audit a redesigned customer portal for over-engineering after earlier
  refactor batches had extracted date, selection, bulk-add and permission
  helpers.
- Stack and conventions: React 19, Next.js 16, TypeScript, date-fns,
  next-intl, a monorepo with shared packages. The user keeps extracted helpers
  deliberately so later features reuse them.
- Skill invocation: `extract-named-helpers` (all references), in audit mode,
  together with build-composable-components, write-feature-tests and
  feature-sliced-design. All skills are React Skills v1.12.0.
- Evidence reviewed: the audit's over-engineering items and the reconsideration
  table; the user's verbatim correction; the accepted implementation handoffs;
  the backend-requests roadmap; the earlier audit that moved the helpers into
  the shared app library; and the current helper source.

## Findings

### F-001: Keep a single-caller helper that names a product rule or reusable transform

- Category: ambiguous-rule
- Severity: medium
- Recurrence: repeated
- Confidence: high

#### Scenario

The code already had extracted helpers, each with one production caller. Some
were product rules with a Business Logic block. Others were small transforms
that encode an external contract, such as the first and last moment of a
calendar day in the backend's local date-time format. The auditor had to
decide whether to inline them.

#### Evidence

origin (do not ingest):

- `frontend/apps/client-portal/lib/format-date.ts:57-65`:

  ```ts
  /** The first moment of a calendar day, as a backend local date-time. */
  export function toDayStartDateTime(day: string): string {
    return `${day}T00:00:00`;
  }
  ```

- Audit proposal O3, `handoffs/client-portal-redesign/react-skills-audit-2.md:157-166`:
  "Each has exactly one caller … extract-named-helpers says a single-module
  caller gets a module-private helper. **Fix:** Make these module-private …
  or inline them."
- The user's correction (2026-09-29), verbatim: "reconsider this for
  overenginner we have compoasable components and extract helpers skill to
  maintain the project and adding new features with already existed
  components and helpers hooks etc. While deciding the overengineering part
  consider future development efforts and features that might we can develop
  on top of what we have".
- Accepted outcome, `react-skills-audit-2.md:393-397` and `:409`: an
  abstraction is kept when it is "a named helper that encodes a product rule
  or a reusable transform". The verdict on O3 is "**KEEP** orders, dossiers
  and invoices period filters are on the backend roadmap and will reuse them".
  K14 had already kept single-caller product-rule helpers: "Each carries a
  product rule with a Business Logic block".
- Accepted narrowing, `refactor-batch-H2.md` O18 row:
  "`getWishlistAddOnNoteId` is no longer exported. Its two users are in the
  same file." That id helper has no domain meaning outside its module.

#### Current behavior

The agent applied the skill's "Do not extract" guidance, written for new
extractions ("Keep … one-line fallback … inline when it has one caller"), to
helpers that already existed and that named a domain concept. Caller count
decided the verdict. It did not consider whether the name carries a product
rule, an external contract, or a transform that planned features need.

#### Preferred behavior

When the agent audits an existing named helper, it keeps the helper named when
the name carries meaning the call site would otherwise lose:

- a product rule (often with a Business Logic block);
- an external contract, such as a wire format or boundary value;
- a reusable transform that a recorded upcoming feature needs.

It inlines a helper only when the helper restates its body. That means the
name adds nothing to `a && !b`, or the helper is a plain alias of another
function. It narrows (un-exports) a helper with no meaning outside its module.
The "Do not extract" rules still govern new extractions.

#### Proposed skill change

- `SKILL.md` "Do not extract": add one closing sentence. "These rules decide
  whether to create a helper. When auditing an existing helper, keep it when
  its name carries a product rule, an external contract, or a transform a
  recorded upcoming feature needs; inline only a restatement or a plain
  alias."
- `references/extraction-triggers.md`: add a short section "Auditing existing
  helpers", with the portable example below and one counterexample.

skill example (ingest this):

```ts
// Keep: the name carries an external contract (the API's inclusive day bound).
// Two scheduled features filter by period and need the same bounds.
export function toDayEndDateTime(day: string): string {
  return `${day}T23:59:59.999`
}

// Inline: the name restates the body and carries no rule.
function isReadyToSave(isValid: boolean, isSaving: boolean) {
  return isValid && !isSaving
}
// -> const canSave = isValid && !isSaving
```

#### Generalization test

Applies to audits and cleanup refactors of existing pure helpers in any
TypeScript codebase. Does not reverse the rule against creating a helper for
a one-line flag composition with one caller. Counterexample: a one-caller
`getItemCount(items) { return items.length }` has no rule and no contract, so
it is inlined even when it already exists. Tension to keep visible: a
one-line fallback such as `parse(day) ?? undefined` was kept in the origin
because a recorded feature reuses it. Without that record, it would be
`revisit`, not automatically inlined.

#### Acceptance criteria

- `SKILL.md` says that the "Do not extract" rules decide whether to create a
  helper, and it gives the audit criterion for existing helpers: product rule,
  external contract, or a transform a recorded feature needs.
- `extraction-triggers.md` contains a keep example and an inline example for
  auditing existing helpers.
- On a fresh audit, an agent given an existing one-caller helper that formats
  an API boundary value, together with a backlog naming a second consumer,
  keeps the helper and cites the backlog.

### F-002: Keep a helper in the lower module when a recorded consumer in another slice needs it

- Category: ambiguous-rule
- Severity: medium
- Recurrence: repeated
- Confidence: high

#### Scenario

An earlier refactor had moved business-agnostic calendar-day helpers from one
feature into the application's shared date library, so that a single module
owns date parsing. Later, the over-engineering audit proposed moving them back
into the one feature that calls them today, because the placement table says a
helper with one consumer module is "module-private" and lists "speculative
exports" under "Never by default". A roadmap already recorded three more
features that need the same bounds.

#### Evidence

origin (do not ingest):

- The earlier move, `handoffs/client-portal-redesign/react-skills-audit.md`
  M13: "`features/offers/utils/offer-list-filters.ts:9-21` holds generic
  calendar-day helpers … **Fix:** make `lib/format-date.ts` the one owner".
- The reversal proposal, `react-skills-audit-2.md:161`: "The M13 move over-did
  it. extract-named-helpers says a single-module caller gets a module-private
  helper."
- The roadmap, `docs/plans/client-portal/portal-redesign/03_BACKEND_REQUESTS.md`:
  orders "Period filter | none | `createdAfter`, `createdBefore` (ISO dates),
  same names as the offer list". Invoices "**Filters:** `search`,
  `createdAfter` / `createdBefore`". Dossiers "**Period filter:** … Request
  `createdAfter` / `createdBefore`."
- Accepted: O3 "**KEEP**" (`react-skills-audit-2.md:409`). The accepted
  batches did not touch `lib/format-date.ts` exports.

#### Current behavior

The agent read "Never by default: speculative exports" as "any export with
one current consumer module". It proposed moving a business-agnostic helper
from the shared library back into a feature. That would create churn, because
the recorded features would force the helper to move again. It would also put
a generic transform inside one business slice.

#### Preferred behavior

An export is speculative when no current or recorded consumer outside its
module exists. When a roadmap, backlog, plan or sibling screen records a
consumer in another module, and the helper is business-agnostic or owned by
the lower domain module, keep it exported from that lower module. When there
is truly one consumer and no record, the existing default stands: a
module-private helper.

#### Proposed skill change

- `SKILL.md` "Placement" table: change the third row to "Never by default:
  exports with no current or recorded consumer outside the module
  (speculative exports), a miscellaneous `helpers.ts`, or one file per tiny
  helper." Add one sentence under the table: "A recorded upcoming consumer
  (roadmap, backlog, plan, sibling screen) counts as a consumer for
  placement."
- `references/placement.md`: add a short paragraph with the example below,
  next to "Consumer count is a default, not a ban on meaningful boundaries".

skill example (ingest this):

```text
Helper: toDayStartDateTime(day) -> "YYYY-MM-DDT00:00:00" (API period bound)
Current callers: one list filter module.
Recorded consumers: two more lists with period filters (backlog items).
Previous placement: make it module-private in the one list module.
Improved placement: keep it exported from the business-agnostic date library,
because recorded consumers in other slices need it and it encodes no product
rule of one slice.
```

#### Generalization test

Applies when a recorded consumer exists in another module, and the helper is
business-agnostic or belongs to a lower domain module. Does not permit
exporting a slice's product rule to shared code, or exporting on a hunch.
Counterexample: a helper that encodes one slice's pricing exception stays in
that slice even if another slice might someday show prices. Placement follows
ownership and dependency direction first (`$feature-sliced-design`).

#### Acceptance criteria

- The placement table defines "speculative export" as one with no current or
  recorded consumer outside its module.
- `placement.md` shows a kept export justified by a recorded consumer, and a
  counterexample where a slice-owned rule is not promoted.
- On a fresh task, an agent asked to "clean up single-caller exports" in a
  date library, with a backlog naming two more consumers, keeps the exports
  and cites the backlog.

### F-003: A one-helper module is fine when it holds a different concern

- Category: ambiguous-rule
- Severity: low
- Recurrence: once
- Confidence: medium

#### Scenario

The app had a seven-line module that resolves the date library's locale
object from the app locale, stored under an i18n folder. The date-formatting
module sits beside it. The audit proposed merging the two, citing "one file
per tiny helper" as a non-default.

#### Evidence

origin (do not ingest):

- `frontend/apps/client-portal/lib/i18n/date-locale.ts`:

  ```ts
  export function getDateFnsLocale(locale: string): DateFnsLocale {
    return locale === "nl" ? nl : enGB;
  }
  ```

- Audit proposal O15, `react-skills-audit-2.md:255-259`: "A separate file for
  one 3-line function … **Fix:** move `getDateFnsLocale` into
  `lib/format-date.ts`".
- Accepted, `react-skills-audit-2.md:421`: "O15 `date-locale.ts` file |
  merge | **KEEP** | the i18n concern is separate from formatting; more locale
  helpers are expected".

#### Current behavior

The agent treated "one file per tiny helper" as a rule about file size. It
proposed merging a locale-resolution module into a formatting module because
the locale module held one function.

#### Preferred behavior

"One file per tiny helper" warns against splitting one concern's helpers
across many files. A small module that holds a *different* concern, with a
purpose name (i18n or locale resolution rather than formatting), is a valid
boundary even with one function, especially when more helpers of that concern
are expected. Placement by purpose is owned by `$feature-sliced-design`.

#### Proposed skill change

- `SKILL.md` "Placement": clarify the "one file per tiny helper" item: "one
  file per tiny helper *of the same concern*; a small module for a separate
  purpose (for example locale resolution next to formatting) is a legitimate
  boundary. Route purpose placement to `$feature-sliced-design`."
- `references/placement.md`: add a two-line example pair.

skill example (ingest this):

```text
Avoid:  date/format-list-date.ts, date/format-long-date.ts, date/parse-date.ts
        (one concern, split one helper per file)
Fine:   date/format.ts (formatting) + i18n/date-locale.ts (locale resolution)
        (two purposes, even if date-locale.ts holds one function today)
```

#### Generalization test

Applies to small modules whose purpose differs from their neighbour's. Does
not permit a new file for every helper of one concern, or a `helpers.ts`
bucket. Counterexample: splitting `formatShortDate` and `formatLongDate` into
two files is still "one file per tiny helper".

#### Acceptance criteria

- The Placement guidance says the one-file-per-helper default is about
  helpers of the same concern, and routes purpose-based placement to
  `$feature-sliced-design`.
- `placement.md` shows one "avoid" split and one "fine" purpose split.
- On a fresh audit, an agent does not propose merging a one-function locale
  module into a formatting module only because of its size.

## Cross-Cutting Decisions

- "Recorded consumer" has the same meaning as in the build-composable-components
  report from this session: a roadmap, backlog, plan, design, sibling screen
  with the same shape, or another app that consumes a published package.
  Speculation means no record.
- The "Do not extract" rules decide whether to create a helper. Audits of
  existing helpers use the keep, inline and narrow criteria in F-001.
- Domain type aliases (`BulkAddToCartItem = ProductAddItem` in the origin)
  were kept "as named contracts" (`react-skills-audit-2.md:417`, O11
  PARTIAL). This supports F-001's principle for types. No separate finding is
  filed, because the skill does not cover type aliases and the evidence is a
  single item.
- feature-sliced-design: no separate report. The one file-placement lesson
  (O15) is covered by FSD's existing "Name segments by purpose" contract and
  its `shared/i18n` and `shared/lib/<purpose>` defaults. The conflicting
  wording is in this skill's "one file per tiny helper" item, so F-003 is
  filed here. FSD decision: `already-covered`.
- Related reports:
  `.agents/feedback/build-composable-components/2026-09-29-over-engineering-judged-against-future-development.md`
  and
  `.agents/feedback/write-feature-tests/2026-09-29-decision-tables-and-change-detectors.md`.

## Validation Requested

- Edit `SKILL.md` ("Do not extract" closing sentence, the Placement table row,
  and the sentence under the table), `references/extraction-triggers.md`
  (auditing section) and `references/placement.md` (recorded-consumer example
  and purpose-split example). Then run the React Skills catalog validation and
  this feedback validator.
- Fresh-task prompt: "Our `lib/time.ts` exports `toRangeStart(day)` and
  `toRangeEnd(day)`, which build the API's inclusive time-range bounds. Each
  has one caller, in the reports screen. `backlog.md` schedules range filters
  for the audit log and the billing history. `lib/i18n/calendar-locale.ts`
  holds one function that maps the app locale to the date library's locale.
  `utils.ts` has `isReady(a, b) { return a && !b }`, used once. Clean up
  over-engineering." Expected: keep both range helpers exported and cite the
  backlog. Keep the locale module as a separate purpose. Inline `isReady`.
- Negative control: the same prompt without `backlog.md`. Expected: the range
  helpers are `revisit` (they encode an API contract), not moved or inlined.
