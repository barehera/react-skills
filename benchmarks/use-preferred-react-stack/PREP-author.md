# use-preferred-react-stack lean-v1: author report

Candidate: `benchmarks/use-preferred-react-stack/variants/lean-v1/` (copied from
`skills/use-preferred-react-stack/` without README.md, registry.json, adapters/).
Not read: `tasks/`, any `results/`, other `PREP-*.md`.

Inputs read: `benchmarks/LESSONS.md`, `build-composable-components/variants/lean-v6/`
(style only), `docs/technology-stack.md`, `docs/adding-a-skill.md`, ledger
`docs/skill-feedback/2026-09-07-decisions.md` and its preserved report
`docs/skill-feedback/use-preferred-react-stack/2026-09-07-stack-library-defaults.md`
(F-001..F-006 preferred behavior and acceptance criteria). The 09-24 and 09-29
ledgers do not touch this skill.

## Word counts (wc -w)

| File | Before | After | Change |
| --- | ---: | ---: | ---: |
| SKILL.md | 838 | 777 | -7% |
| references/decision-table.md | 417 | 210 | -50% |
| references/tanstack-pacer.md | 381 | 299 | -22% |
| references/zustand.md | 271 | 225 | -17% |
| examples/search-composition.md | 378 | 202 | -47% |
| **Prose total** | **2285** | **1713** | **-25.0%** |
| examples/*.ts(x), scripts/verify-pacer.mjs, agents/openai.yaml | 531 | 531 | unchanged |
| **All files** | **2816** | **2244** | **-20.3%** |

The 30% target was not reached (25% of prose). SKILL.md is now mostly the
11-row decision table (about 280 words) that F-001's acceptance criteria require
(default, "avoid" list, and boundary per concern), plus the F-004 compiler
boundary and the contract sections. Cutting further would mean rewording table
boundaries, which LESSONS.md identifies as the main regression risk. SKILL.md is
97 lines; all required sections present.

## Code and scripts

No example code, script, or `agents/openai.yaml` changed (byte-identical to
source), so no new type-check was needed; the source copies are covered by
`tsconfig.examples.json` and `scripts/skill-examples.test.mjs` (which imports
`createPreferencesStore`). `node variants/lean-v1/scripts/verify-pacer.mjs` run
from the repo root: passes, "Verified Pacer 0.18.0", all 15 subpaths resolve.

## SKILL.md

- Layer placement: kept the shared three-layer paragraph verbatim; dropped
  "It chooses one owner per concern and then routes the code to the skill that
  owns the layer" (restates the one-line outcome); kept the three per-layer
  routes.
- Workflow step 2: "Identify the concern and its state owner using the table"
  -> "Pick the concern's owner from the table"; incumbent rule kept (keep
  incumbent, mention default once, no unrelated migration; ledger cross-cutting
  decision).
- Step 3: dropped "rechecked when the installed version differs" (stated in the
  Pacer reference and printed by the script).
- Step 4: dropped "Installing this skill installs guidance, not the whole
  runtime stack" (merged with the "not a requirement to install Next.js..."
  sentence moved here from decision-table.md, placed under the table).
- Table and its "Avoid adding applies to new choices" line: verbatim (F-001,
  precise boundaries).
- Dropped "Read decision-table.md for rationale..." and "This extends the
  catalog's opinionated stack; companion skills remain opinionated too"
  (catalog-maintainer meta; link kept in the guidance list).
- React Compiler: same rules, tighter sentences (check enabled config not
  package presence; no routine memo; never mass-remove; removal only in code
  being changed after identity/test checks; leave unrelated/generated/
  third-party code; plain code without compiler, profiling or identity contract
  to justify). Dropped "Module-level helpers do not automatically cache
  results": owned by `extract-named-helpers` (its F-006), restated here.
- Companion routing: list verbatim; dropped "Do not duplicate its structural
  guidance in this skill" (authoring note, not an agent instruction; F-005 is
  satisfied by the routing list and by no restated structure).
- Focused guidance: same nine links, labels shortened.

## references/decision-table.md (title now "Setup boundaries per library")

- Cut the intro restating that the SKILL table is for selection.
- Pacer bullet removed: repeated the table row; "Query owns retries / do not
  multiply retry layers" kept once in tanstack-pacer.md.
- Query/Axios bullet: kept only routing plus "do not invent a backend contract
  to demonstrate them"; "Axios stays below feature queries in the wrapper"
  already in the table row.
- Zustand bullet removed: all three points are in zustand.md (scope, no store
  instead of local state/context is in the table, never persist Query
  snapshots).
- nuqs: all specifics kept (typed parsers, defaults, `nuqs/adapters/next/app`,
  `nuqs/server`, replace/push and shallow/server choice, back/forward and
  clearing tests, no Zustand mirror).
- React Hook Form: dropped the `zodResolver` import path (generic knowledge;
  the table names zodResolver); kept "a search filter does not need a submitted
  form model" and routing.
- next-intl: kept both APIs and reuse of request config/provider/locale files;
  "do not impose the origin project's English-only policy" folded into the
  table's "Follow locale policy"; kept "no translations for locales out of
  scope".
- sonner and T3 Env: rules kept, wording tightened.
- React Compiler bullet removed (SKILL.md section owns it). Framer Motion
  sentence removed (report noise with no finding; incumbent rule covers it).
- Dropped doc links for nuqs basic usage/adapters, next-intl, sonner, T3, React
  Compiler (workflow step 3 still requires version-matched docs).

## references/tanstack-pacer.md

- Import map table and "other exports" list verbatim; "no `ratelimiter` or
  `queue` subpath" kept; F-002 decision kept as "`useRateLimiter` and
  `useQueuedState` exist at the subpaths above" (dropped the history clause
  "the reported defect was their import paths").
- Removed the `useDebouncedCallback` code sample: trivial once the table gives
  the path. Hook-vs-class split (F-002) kept as prose; class `RateLimiter`
  example kept (it carries the options shape and the outside-React lifetime).
- Kept: `useDebouncer` for cancel/flush/reactive state with a selector,
  `useDebouncedValue` for derived request input, 0.18.0 unmount cancellation,
  shared-budget creation, no cross-request user budgets, frontend limiter is
  not enforcement, cleanup, Pacer retry only for non-Query work.
- Dropped the second docs link; kept that the pinned package backs the map.

## references/zustand.md

- Table verbatim. Dropped "Choose scope before create versus createStore" (the
  table states it) and "Read the complete preferences store/provider example
  and banner store" (SKILL.md links them).
- Dropped "Define account-switch reset, schema migrations, and storage
  availability according to the product contract" (generic; the walkthrough
  keeps the concrete account-switch remount).
- Dropped Zustand doc links. All other rules kept: per-provider store in Next,
  `use client` is not request isolation, no request data in server singletons,
  no client store in Server Components, initial state + reset action,
  `ReturnType` handle through context, narrow subscriptions, persist only on
  need with `partialize`, never persist snapshots/flags/actions, resolve IDs
  against fresh data, skip hydration + client rehydrate, `clearStorage()` caveat,
  FSD placement and "origin conventions, not mandates" (ledger cross-cutting).

## examples/search-composition.md

- Kept the walkthrough (ledger: it is the fresh-task composition) but only its
  facts the references do not already state: Suspense boundary for client URL
  hooks, account-scoped `storageKey` with remount by `key`, hydration-after-
  mount consequences and optional gating, URL updates immediately with
  debounced derived input and no second writable store, query enabled on
  `!isDebouncing`, Axios abort signal, no debounce inside the query function,
  one error owner plus visible retry.
- Removed: "inspect package.json first" (workflow step 1), the provider list
  (now "reuse the app's existing providers"), "Query owns records and retries",
  "do not persist results", "not from every observer", backend/bootstrap owner
  sentence, the browser-check list (workflow step 5 lists the same lifecycle
  behaviors), and the banner-store paragraph (zustand.md table and SKILL link
  label cover it).

## Uncertain

- Removing the browser-check list may reduce how often runs report concrete
  verification steps; step 5 still names the behaviors.
- Dropping the `zodResolver` import path and the official-doc links assumes the
  model knows them; low risk but unmeasured.
- The search walkthrough still mirrors the report's validation prompt
  (search + URL + persisted sort + toast). LESSONS.md says such examples teach
  recall; it was kept because the ledger records it as the canonical
  composition. A later round could test removing it.
- The source skill does not speak to the owner's UI bar (components/ui by role,
  typed size/variant); nothing was added for it, since that belongs to
  `build-composable-components` and added sentences are the main risk.
