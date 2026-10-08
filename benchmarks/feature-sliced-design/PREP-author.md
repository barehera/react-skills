# PREP: feature-sliced-design lean-v1 (author report)

Candidate: `benchmarks/feature-sliced-design/variants/lean-v1/` (copied from
`skills/feature-sliced-design/` without README.md, registry.json, adapters/).
Source skill is untouched. Tasks, results, and other PREP files were not read.

## Word counts (`wc -w`)

| File | Baseline | lean-v1 | Change |
| --- | ---: | ---: | ---: |
| SKILL.md (lines: 133 → 125) | 1075 | 961 | -11% |
| references/architecture-and-placement.md | 1105 | 727 | -34% |
| references/framework-and-runtime-boundaries.md | 971 | 665 | -32% |
| references/migration-and-review.md | 787 | 428 | -46% |
| references/slices-and-imports.md | 725 | 567 | -22% |
| examples/next-app-router/README.md | 578 | 312 | -46% |
| agents/openai.yaml | 24 | 24 | 0 (unchanged; CRLF normalized to LF) |
| **Total** | **5265** | **3684** | **-30.0%** |

Prose only (fenced blocks excluded): 4911 → 3450 (-29.7%). The harness counter
reports the baseline as 5495 words, so its numbers will differ slightly.

## SKILL.md

- **Version**: cut the sentence explaining that VERSION is shared. It does not
  change what the agent does (same cut as bcc lean-v6).
- **Layer placement**: "primitives and generic families under the shared
  foundation" became "primitives and generic families in `shared/ui`, named by
  UI role". This states the owner's bar (generic components named by UI role)
  in FSD terms. It is a reworded sentence, so it carries risk (see Uncertain).
- **Required workflow** (10 → 9 steps): merged step 1 (inspect) and step 3
  (profile) into one profiling step, because the two lists overlapped. Gave
  reference links short descriptors. Shortened step 9 (checks) to "the
  repository's checks, including a production build" and kept "no new linter
  without approval". Step 10 (report) absorbed the reference's
  "Completion report" section, which repeated it. Kept unchanged: owner before
  kind ("what changes with this file?"), preserve established architecture,
  smallest change and no empty folders, no compatibility barrels without a
  requested legacy bridge.
- **Core contracts**: all 14 rules kept, with wording tightened only where the
  boundary stays the same (for example "Keep raw transport ... in `api`" became
  "Raw transport ... live in `api`"). Dropped "Preserve environment boundaries."
  as a lead-in phrase; its client/server import rule is kept word for word.
- **Companion routing**: same three companions and the same install policy;
  dropped the "Use ... for" verb scaffolding.
- **Defaults**: kept Next.js `_app`/`_pages`, the starting layer set, and the
  Shared segment list, which carries the `shared/i18n` ledger outcome. Added
  "Each primitive or generic family is one `shared/ui/<role>.tsx` file named
  by UI role, never by a record type" (owner bar). Cut "Put feature-specific
  UI, model ... in that feature": core contract 4 and the ownership model
  already say it. Cut "Define a slice's external contract with real
  implementation modules at stable direct paths": the barrel contract and
  slices-and-imports already say it.

## references/architecture-and-placement.md

- Cut the "Research basis" links, because a strong model knows the FSD spec.
  Kept the sentence saying that this skill swaps FSD's `index.ts` public API
  for direct imports, because that is a deliberate departure.
- Merged the Layer decisions table into the 7-step ownership model, because
  the table's "Owns" column repeated the steps. Each step now carries the
  table's "does not own" boundary (for example "never feature workflows or
  reusable UI primitives" and "not every page section by default"). Kept the
  deprecated `processes` rule.
- Root folder map: changed from 3 columns to 2 and merged related rows
  (`assets`+`public`, `config`+`constants`, `schemas`+`types`). Every
  destination and rule is kept, including fixing the `scriipts` misspelling
  and "no global constants catalog". The `store` row now also holds the
  framework reference's Zustand paragraph (store-creation helpers in
  app/shared, never mirror Query records into Zustand). The `assets` row now
  holds "never both" from the framework reference.
- Shared promotion: kept all five checks. **Cut** "Prefer temporary
  duplication over a premature shared abstraction". It conflicts with the
  owner's "no repeated code" bar, and the five checks plus "similar-looking
  code is not proof" in SKILL.md still stop premature promotion.
- Cut "Avoid empty architecture", which repeated workflow step 6 and the
  defaults. Cut the contents list, because the file is now 81 lines.

## references/slices-and-imports.md

- Feature test: cut the `widgets` bullet, which repeats ownership step 4. Kept
  the entity, one-page block, and `shared/ui` bullets and the naming ban.
- Dependency direction: cut the ASCII graph and the restated sub-rules ("Shared
  imports no business layer" and similar), because SKILL.md states the
  direction. Kept the relative-inside and alias-across import examples.
  Changed `@/shared/ui/button/button` to `@/shared/ui/button` (see Uncertain).
- Direct public paths: 7 points became 4. Points 2, 5, and 6 (the barrel
  rules) live in SKILL.md core. Kept capability naming, private helpers, no
  index import cycle, package `exports` map, the enforcement sentence (now
  with "because" as its reason), and preserving existing index APIs during
  scoped work.
- Cross-slice composition: cut "Extract a generic foundation to Shared only
  when business-agnostic", which repeats the SKILL promotion contract.
- Tests and stories: compressed, same rules.

## references/framework-and-runtime-boundaries.md

- Next.js layout: cut the tree, which is a subset of the example tree and is
  now linked. Kept the reason for the underscore, middleware and
  instrumentation at the root, and the plain `src/app` names for Vite and
  React Router.
- Route handlers: cut "keep `app/api/**/route.ts` at the framework path",
  which repeats ownership step 1. Kept `_app/api-routes`, the feature `api`
  segment, and "no large backend in the FSD tree".
- Server Actions: **cut** "validate untrusted input with Zod; keep authz on
  the server". It is generic security knowledge and not placement, and the
  example still says the action "validates its input". Kept the owner, the
  `.server.ts` naming and narrow `"use server"`, and "never through a
  client-facing aggregate".
- API vs server state table: kept as is. Cut "never put Query hooks in
  `api`", which repeats SKILL core and the table.
- Providers: compressed. Moved the Zustand paragraph into the `store` row of
  the folder map.
- Integrations: cut the vendor name list and the Firebase tree (the example
  shows it). Cut the Firebase bullets that repeat SKILL core (the client may
  not import server credentials, no `index.ts` re-exports, and the server app
  stays out of the client graph). Kept Remote Config defaults as static config
  with flag interpretation in the feature, app-owned integration startup with
  feature-owned events, and the analytics placement rules.
- Assets paragraph: moved into the folder map. Env and i18n are kept, and i18n
  keeps the colocated-namespace rule (ledger 2026-09-29 outcome).

## references/migration-and-review.md

- Create: cut "verify roots and choose alias" and "identify first pages",
  because a strong model does this generically and workflow step 1 covers it.
  Kept the first vertical slice, linting only with approval once paths are
  real, validating before repeating, and never copying example domains.
- Place one feature: 7 steps became one paragraph, with the generic steps cut.
- Migrate: kept all steps except the technical-bucket conversion list, which
  repeated the root folder map and is now linked. Kept the
  compatibility-bridge rule.
- Audit: merged the "Review checklist", which mostly restated core contracts,
  into the audit list and added "Check every core contract in SKILL.md". Kept
  every audit finding type, plus the checklist-only items: separate owners
  for transport/Query/Zustand/forms/UI, and tests/assets/config following
  their code. The "no fixes unless authorized" rule is kept.
- Cut "Completion report", which moved to workflow step 9. Cut the contents
  list, because the file is now 65 lines.

## examples/next-app-router/README.md

- The tree is kept except `shared/ui/button/button.tsx` →
  `shared/ui/button.tsx` (and the same for dialog), with the public path
  `@/shared/ui/button`.
- Replaced the route snippet with one sentence (await params, render the page,
  no re-export), because it carries no shape that words do not. Cut the page
  pass-through snippet. Kept the widget snippet, which shows sibling features
  composed above Features.
- Server decisions: cut the QueryClient and webhook bullets, which the tree
  and the framework reference already show.
- Cut "Why the original flat folders disappeared", which repeated the root
  folder map. Cut the closing "target model, not a command" sentence, which is
  workflow step 4 (preserve the established architecture).
- No TypeScript changed in a compiled file. FSD examples are prose snippets
  that are not in `tsconfig.examples.json`, and the remaining widget snippet
  is unchanged, so no type-check was required. The skill ships no scripts.

## Decision ledgers checked

- 2026-09-07: FSD was reviewed and its business-ownership rules are
  already-covered; app-wide store placement routes to FSD. Kept: store
  placement (folder map `store` row, scoped stores in owner `model`).
- 2026-09-29 (F-003 and "Not changed"): FSD already-covered because of
  purpose-named segments and `shared/i18n` defaults (locale-module boundary).
  Both are kept: the purpose-segment core contract, the `shared/i18n` default,
  the `locales` row, and the i18n paragraph.
- 2026-09-24: placement stays with FSD. The skill still owns placement,
  including test and story placement.

## Uncertain

1. **Flat `shared/ui/<role>.tsx`** (was `shared/ui/button/button.tsx`). It
   aligns with the owner's "generic components named by UI role", with shadcn's
   flat `ui` alias output, and with bcc lean-v6. It is new wording, though, and
   could change run structure. Revert to the folder-per-component form if the
   benchmark penalizes it.
2. **Cross-skill conflict, not resolved here.** bcc lean-v6 defaults to
   `components/ui/<role>.tsx` and `features/<feature>/components/<record>-<role>.tsx`.
   FSD forbids a `components` segment and uses `shared/ui` plus a slice `ui`
   segment. When both skills load in one run, the output may mix the two. The
   owner needs to decide which default wins when FSD applies. A one-line
   routing note in either skill would settle it, but it would be a new
   sentence that needs measuring.
3. **Dropped "prefer temporary duplication"**, which the owner's no-repeat bar
   motivated. Watch for runs that promote similar code to Shared too early.
   The five checks should still prevent it.
4. **Dropped Server Action Zod/authz bullet** from the reference. It stays only
   in the example.
5. **Description left unchanged** (86 words). It was not trimmed, to avoid
   changing trigger behavior.
