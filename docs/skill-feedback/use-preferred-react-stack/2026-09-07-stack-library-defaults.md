---
feedback_version: 1
target_skill: use-preferred-react-stack
target_skill_version: unversioned
source_project: genie_website
captured_at: 2026-09-07
status: ready
---

# Skill Feedback: use-preferred-react-stack

## Executive Summary

The user maintains several Next.js projects on the same library stack (Zustand,
TanStack Query, TanStack Pacer, React Hook Form + Zod, next-intl, nuqs, sonner,
React Compiler). The installed skill catalog (`.agents/skills`, VERSION 1.8.0)
teaches *how* to build forms, server state, and composable components, but it
deliberately stays library-agnostic ("repository-native primitives", "when the
repository already uses Zustand"). Nothing in the catalog owns the decision
*which* library a fresh task should reach for, so the user re-writes the same
`.cursor/rules/*.mdc` files in every project, and one of those hand-written
rules has already drifted from the real package API.

This report proposes a **new catalog skill**, `use-preferred-react-stack`, that
acts as the knowledge base for the user's default library choices: a
concern-to-library decision table, verified import maps, the idioms each
library is expected to follow, and routing into the existing skills for deeper
work. The target is the skill catalog, not this repository's product code.

## Project Context

- Task: replace per-project Cursor rules about library selection with a
  portable skill so the same guidance follows the user to every project.
- Stack and conventions: Next.js 16.3 (App Router), React 19.2 with
  `babel-plugin-react-compiler` 1.0, TypeScript 5, Tailwind 4 + shadcn/Radix,
  Zustand 5, `@tanstack/react-query` 5.90, `@tanstack/react-pacer` 0.18,
  `react-hook-form` 7.68 + `@hookform/resolvers` 5.2 + Zod 4.2, `next-intl`
  4.6, `nuqs` 2.8, `sonner` 2, `@t3-oss/env-nextjs`, `framer-motion` 12,
  `axios`. Repository rules in `.cursor/rules/`: `tanstack-pacer.mdc`,
  `react-compiler-no-manual-memoization.mdc`, `manage-server-state.mdc`
  (thin pointer to the skill), `english-only-i18n.mdc`, `business-documentation.mdc`.
- Skill invocation: none. The user asked, in chat, for a feedback report that
  leads to a new skill because the existing skills "don't know about the
  technologies the rules should use".
- Evidence reviewed: `package.json`; `.cursor/rules/*.mdc`; every
  `.agents/skills/*/SKILL.md` and references, grepped for library names;
  `node_modules/@tanstack/react-pacer/package.json` `exports`; ripgrep counts
  of library imports across `**/*.{ts,tsx}`; representative files listed per
  finding.

## Findings

### F-001: No skill owns the concern-to-library decision, so it is re-encoded per project

- Category: missing-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

A fresh task needs a debounce, a piece of client-side state, a form, a URL
query parameter, or a toast. The agent must pick a library. The catalog skills
each assume the choice was already made elsewhere.

#### Evidence

- `.agents/skills/build-forms/SKILL.md:157-158`: "Scoped Zustand for optional
  externally supplied form-wide properties only when the repository already
  uses Zustand or the user requests it."
- `.agents/skills/build-composable-components/SKILL.md:100`: "Use ordinary
  props, React context, or a scoped Zustand vanilla store according …" (no
  guidance on when to prefer which library family).
- `rg -il` over `.agents/skills/**/*.md`: zero mentions of TanStack Pacer,
  next-intl, nuqs, or sonner; Zustand and React Hook Form appear only as
  conditional options.
- Usage in the origin repository (files importing each library): `next-intl`
  236, `@tanstack/react-query` 90, `zod` 54, `sonner` 49, `framer-motion` 36,
  `zustand` 35, `@tanstack/react-pacer` 15, `nuqs` 11, `react-hook-form` 10.
- User statement (chat, 2026-09-07): "I have .agents react-skills there but
  they dont know about the technologies the rules should use … so I dont have
  to write .cursor rules for all projects."
- The user's workaround is a per-project rule such as
  `.cursor/rules/tanstack-pacer.mdc` ("always use TanStack Pacer instead of
  custom implementations or other libraries").

#### Current behavior

The agent picks libraries from repository imports or from ad-hoc Cursor rules.
When a project is new or a rule file is missing, nothing prevents `lodash.debounce`,
hand-rolled `setTimeout` throttles, `useState` for URL-derived state, React
context for cross-tree client state, or `alert`/custom toasts.

#### Preferred behavior

One skill publishes the user's default stack as a decision table keyed by
concern, each row naming the default library, the reason, and the boundary
where the default does not apply. Other skills stay library-agnostic and point
to this table.

Skill example (ingest this):

| Concern | Default | Do not use instead | Boundary / escape hatch |
| --- | --- | --- | --- |
| Timing control (debounce, throttle, rate limit, queue, batch, retry) | TanStack Pacer | custom `setTimeout` loops, lodash, `use-debounce` | A single one-shot delay may stay `setTimeout`; anything repeated or rate-based is Pacer |
| Server / remote state | TanStack Query | `useEffect` + `useState` fetching, SWR | Route to `manage-server-state` for structure |
| Client state shared across a subtree or app | Zustand | Redux, Jotai, prop-drilling context objects | Local `useState` for component-private state; React context only for stable, rarely-changing values |
| URL-synchronised state | nuqs | manual `useSearchParams` + `router.replace` | Server components read `searchParams` directly |
| Forms + validation | React Hook Form + Zod via `@hookform/resolvers/zod` | Formik, uncontrolled ad-hoc forms | Route to `build-forms` for field composition |
| i18n strings | next-intl (`useTranslations` / `getTranslations`) | inline strings, other i18n libs | Follow the repository's locale-file policy |
| Toasts / transient notices | sonner | `alert`, custom toast stacks | Persistent status belongs in UI state, not toasts |
| Typed env access | `@t3-oss/env-nextjs` | raw `process.env` reads in features | Build scripts may read `process.env` |
| Memoisation | React Compiler | `useMemo`, `useCallback`, `memo` wrappers | See F-004 for legacy code |

#### Proposed skill change

Create `use-preferred-react-stack/SKILL.md` whose core contract is the table
above plus a short "how to confirm the repository actually installed the
default" step (check `package.json` before importing). Add
`references/decision-table.md` with the full rows, rationale, and escape
hatches. The skill description should trigger on "which library", "add
debounce/throttle", "add store", "add form", "add query param", "show toast",
and on any new Next.js/React feature work.

#### Generalization test

Applies to any React or Next.js repository the user owns where the default
stack is intended. Should not override a repository that has explicitly chosen
a different library for a concern (for example a legacy Redux store); the skill
must instruct the agent to detect an existing incumbent and follow it. Should
not apply to non-React code such as Node build scripts or GitHub Actions.

#### Acceptance criteria

- `SKILL.md` contains a decision table with at least the nine concerns above,
  each with a default, a "do not use instead" list, and a boundary.
- On the fresh-task prompt in `Validation Requested`, the agent chooses Pacer,
  Zustand, nuqs, and sonner without any `.cursor/rules` file present, and
  states that it checked `package.json` first.
- The skill explicitly defers structural guidance to `manage-server-state`,
  `build-forms`, and `build-composable-components` instead of duplicating it.

### F-002: The hand-written Pacer rule drifted from the real package API

- Category: bad-example
- Severity: medium
- Recurrence: repeated
- Confidence: high

#### Scenario

The user encoded TanStack Pacer usage in a Cursor rule from memory. The
package's subpath exports and hook names were paraphrased rather than
verified.

#### Evidence

- `.cursor/rules/tanstack-pacer.mdc:27-33` lists imports
  `'@tanstack/react-pacer/ratelimiter'` and `'@tanstack/react-pacer/queue'`
  and hooks `useQueuedState`, `useRateLimiter`.
- `node_modules/@tanstack/react-pacer/package.json` (`0.18.0`) `exports`:
  `./async-batcher ./async-debouncer ./async-queuer ./async-rate-limiter
  ./async-retryer ./async-throttler ./batcher ./debouncer ./provider ./queuer
  ./rate-limiter ./throttler ./types ./utils`. Neither `ratelimiter` nor
  `queue` exists.
- Actual imports in the repository already use the correct paths:
  `hooks/use-run-once.tsx:5` `import { RateLimiter } from '@tanstack/react-pacer/rate-limiter'`;
  `libs/logger/index.ts:1` `import { AsyncQueuer } from '@tanstack/react-pacer/async-queuer'`;
  `utils/create-debounced-json-storage.ts:1` `import { Debouncer } from '@tanstack/react-pacer/debouncer'`;
  `features/settings/components/settings-memories.tsx:11` `import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer'`.

#### Current behavior

An agent following the rule literally would emit an import that fails module
resolution and then either guess or fall back to a custom implementation.

#### Preferred behavior

The skill ships a verified import map generated from the package's `exports`,
distinguishes the vanilla class API (usable outside React: `new RateLimiter`,
`new Debouncer`, `new AsyncQueuer`) from the React hook API
(`useDebouncedCallback`, `useDebouncer`, `useThrottler`, …), and tells the
agent to re-verify against the installed version when the major/minor differs.

Skill example (ingest this):

```ts
// Inside React: hook API
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer';

const save = useDebouncedCallback((next: Draft) => persist(next), { wait: 400 });

// Outside React (module-level singleton, storage adapter, logger): class API
import { RateLimiter } from '@tanstack/react-pacer/rate-limiter';

const limiter = new RateLimiter(() => {}, { limit: 1, window: 60_000, windowType: 'sliding' });
```

#### Proposed skill change

Add `references/tanstack-pacer.md` to `use-preferred-react-stack` with: the
verified subpath list, a class-vs-hook decision rule, the five core operations
mapped to their subpath, and a note that the list is pinned to a package
version. Add a review-checklist line in `SKILL.md`: "Import paths for Pacer
come from the reference, not from memory."

#### Generalization test

Applies to any library whose subpath exports are easy to misremember; the same
"verify against `exports`" habit should be stated once in `SKILL.md` and
applied to every library in the table. Does not require the skill to mirror
every hook signature; a subpath map plus the class/hook split is enough.

#### Acceptance criteria

- Every import path in the Pacer reference resolves against
  `@tanstack/react-pacer` `0.18.x` `exports`.
- On a fresh task asking for a rate limiter shared by several call sites, the
  agent imports from `'@tanstack/react-pacer/rate-limiter'` and instantiates
  the class outside the component, without hallucinating a `ratelimiter`
  path.

### F-003: Zustand store idioms are undocumented, so global versus scoped stores are chosen inconsistently

- Category: missing-example
- Severity: medium
- Recurrence: repeated
- Confidence: medium

#### Scenario

Adding client state that outlives one component. The repository has two
established shapes, but no skill describes when each applies.

#### Evidence

- Global store shape, `store/use-review-popup-store.tsx:26-41`: `create<State>()(persist((set) => ({ ...initialState, openPopup, closePopup, clearStore: () => set({ ...initialState }) }), …))` with a separate `initialState` object and a `clearStore` action.
- Scoped store shape, `features/chat/store/use-model-store.tsx:3-7,29`:
  `createStore` from `zustand` plus a React context/provider and
  `useStore(store, selector)`; `type ModelStore = ReturnType<typeof createModelStore>`.
- Persistence boundary comment, `features/chat/store/use-model-store.tsx:15-19`:
  only the model slug is persisted, never the fetched `WebModel` snapshot,
  because the snapshot can go stale.
- Directory convention: app-wide stores live in `store/`, feature stores in
  `features/<feature>/store/`; 35 files import from `zustand`.
- `.agents/skills/build-composable-components/references/state-and-lifecycles.md`
  covers scoped vanilla stores for component families only.

#### Current behavior

The agent has to infer the shape from neighbouring files. In a new project
with no neighbours it may produce a context-only or prop-drilled solution, or
persist whole server objects.

#### Preferred behavior

The skill states two shapes and a persistence rule:

- App-wide singleton: `create<State>()(…)`, colocated `initialState`, a
  `clearStore`/`reset` action, optional `persist` with `createJSONStorage`.
- Feature- or subtree-scoped: `createStore` + provider + `useStore(store,
  selector)`; the store type is `ReturnType<typeof createXStore>`.
- Persist stable identifiers, never fetched snapshots; resolve identifiers back
  to fresh data on read.

Skill example (ingest this):

```ts
const initialState = { isOpen: false, count: 0 };

export const useNoticeStore = create<NoticeState>()(
  persist(
    (set) => ({
      ...initialState,
      open: () => set({ isOpen: true }),
      reset: () => set({ ...initialState }),
    }),
    { name: 'notice', storage: createJSONStorage(() => localStorage) },
  ),
);
```

#### Proposed skill change

Add `references/zustand.md` to `use-preferred-react-stack` with the two shapes,
the persistence rule, and the placement convention (`store/` versus
`features/<feature>/store/`). Cross-link from the decision table row for
client state. Point to `build-composable-components` for stores that belong to
a compound component.

#### Generalization test

Applies whenever client state must be shared beyond one component. Does not
apply to server state (TanStack Query owns it) or to component-private state
(`useState`). Counterexample: a controlled/uncontrolled prop pair inside a
compound component should stay in the component skill's scoped-store pattern,
not become an app-wide store.

#### Acceptance criteria

- The reference shows both shapes with a one-line "use when" for each.
- On a fresh task "remember the user's dismissed banner across reloads", the
  agent produces a `create` + `persist` store with a reset action and persists
  only the banner id.

### F-004: React Compiler memoisation policy needs a legacy boundary

- Category: ambiguous-rule
- Severity: low
- Recurrence: repeated
- Confidence: high

#### Scenario

Editing a file that already contains `useMemo`/`useCallback` while the
always-on rule says "never introduce or use".

#### Evidence

- `.cursor/rules/react-compiler-no-manual-memoization.mdc:5-7`: "Never
  introduce or use `useMemo` or `useCallback`."
- `package.json`: `babel-plugin-react-compiler ^1.0.0`,
  `eslint-plugin-react-compiler` present in `eslint.config.mjs`.
- 25 files still call `useMemo(` and 15 call `useCallback(` (for example
  `hooks/use-search.tsx`, `components/theme-switch.tsx`,
  `components/media-preview-modal.tsx`).
- `.agents/skills/build-composable-components/references/state-and-lifecycles.md`
  and `extract-named-helpers/references/hooks-and-helpers.md` mention
  memoisation but not the compiler.

#### Current behavior

"Never use" reads as "remove on sight", which invites unrelated refactors in
files the task did not need to touch.

#### Preferred behavior

Rule with boundary: do not add new manual memoisation; do not mass-remove
existing calls; remove them only when already editing that code and the
compiler is enabled in the repository (`babel-plugin-react-compiler` present).
If the compiler is not installed, the default is still to write plain
functions and ask before adding memoisation.

#### Proposed skill change

Add a "React Compiler" row and a short "legacy boundary" paragraph to
`use-preferred-react-stack/SKILL.md`. Mention the detection check (compiler
plugin in `package.json` or Next config) so the rule is portable to projects
without the plugin.

#### Generalization test

Applies to React 19 projects with the compiler enabled. Does not license
removing `memo`/`useMemo` from third-party or generated code, and does not
apply to non-React utilities.

#### Acceptance criteria

- The skill text contains both the "do not add" rule and the "do not
  mass-remove" boundary.
- On a fresh task that edits one function in a file containing an unrelated
  `useMemo`, the agent leaves the unrelated `useMemo` untouched and adds none.

### F-005: The new skill must route to existing skills rather than duplicate them

- Category: missing-rule
- Severity: medium
- Recurrence: structural
- Confidence: high

#### Scenario

Once a library is chosen, structure and naming are already covered by
`manage-server-state` (TanStack Query), `build-forms` (React Hook Form + Zod),
and `build-composable-components` (scoped state, shadcn/Radix). A stack skill
that restates their content would drift.

#### Evidence

- `.cursor/rules/manage-server-state.mdc` is already a thin pointer: "Read and
  follow `@.agents/skills/manage-server-state/SKILL.md` before changing
  remote-state code."
- `features/form/components/form-wrapper.tsx:5,57` wires `zodResolver(schema)`
  once in a shared wrapper, matching `build-forms` guidance.
- `.agents/skills/manage-server-state/SKILL.md` and `references/backend-contracts.md`
  already own Zod-for-API-schemas guidance.

#### Current behavior

Not applicable yet; this is a design constraint for the new skill.

#### Preferred behavior

`use-preferred-react-stack` owns *selection and idioms*; it delegates
*structure* with explicit hand-offs: "TanStack Query → follow
`manage-server-state`", "React Hook Form → follow `build-forms`", "scoped
component state → follow `build-composable-components`".

#### Proposed skill change

Add a "Hand-offs" section to `use-preferred-react-stack/SKILL.md` listing the
three routes. Add a reciprocal sentence to each of the three skills' `SKILL.md`
("Library defaults come from `use-preferred-react-stack` when installed") so
the catalog stays coherent.

#### Generalization test

Applies to every concern where a deeper skill exists. Where none exists (Pacer,
nuqs, sonner, next-intl), the stack skill's own reference is the terminal
guidance.

#### Acceptance criteria

- `use-preferred-react-stack/SKILL.md` names the three hand-off skills.
- No paragraph in the new skill restates query-key, cache, or field-composition
  rules already present in the routed skills.

### F-006: Per-project Cursor rules should become thin pointers to the skill

- Category: project-convention
- Severity: low
- Recurrence: structural
- Confidence: high

#### Scenario

After the skill exists, the origin repository still carries full-text rules
that will drift again.

#### Evidence

- `.cursor/rules/tanstack-pacer.mdc` (34 lines, contains the wrong import
  paths from F-002).
- `.cursor/rules/react-compiler-no-manual-memoization.mdc` (7 lines,
  `alwaysApply: true`).
- `.cursor/rules/manage-server-state.mdc` demonstrates the preferred
  pointer style with `globs` and `alwaysApply: false`.

#### Current behavior

Guidance is duplicated between rules and skills, and the rule copy is the one
that went stale.

#### Preferred behavior

Each project keeps one short rule, `.cursor/rules/use-preferred-react-stack.mdc`,
that says "Read and follow `@.agents/skills/use-preferred-react-stack/SKILL.md`
when choosing or using a library for timing, state, forms, URL state, i18n,
toasts, env, or memoisation", and deletes the full-text
`tanstack-pacer.mdc`. The compiler rule may stay `alwaysApply: true` as a
one-line pointer because it must fire on every edit.

#### Proposed skill change

None to the skill itself. Consuming-repo change: replace
`.cursor/rules/tanstack-pacer.mdc` with the pointer rule and shorten
`.cursor/rules/react-compiler-no-manual-memoization.mdc` to reference the
skill's boundary text, once the skill is installed.

#### Generalization test

Applies to every project that installs the skill. Not applicable to projects
that intentionally deviate from the default stack; those keep an explicit
local rule naming the incumbent library.

#### Acceptance criteria

- The origin repository's rules directory contains no full-text Pacer import
  list after the skill is installed.
- The pointer rule triggers on the same phrases as the skill description.

## Cross-Cutting Decisions

- Terminology: "default stack" means the user's preferred library per concern;
  "incumbent" means a different library a repository already committed to. The
  skill instructs: detect the incumbent, follow it, and mention the default
  once.
- Ownership: `use-preferred-react-stack` owns *which* library and its idioms;
  `manage-server-state`, `build-forms`, and `build-composable-components` own
  *how* to structure code with it.
- Verification habit: import paths and hook names in the skill are pinned to a
  package version and must be re-checked against `package.json` `exports` when
  the installed version differs. This habit is the direct lesson of F-002.
- Placement convention observed in the origin repository and worth publishing
  as a default (not a mandate): `store/` for app-wide Zustand stores,
  `features/<feature>/store/` for feature stores, `features/<feature>/server-state/`
  for TanStack Query code.
- User preference: guidance should live in the portable skill catalog, with
  `.cursor/rules` reduced to pointers, so new projects need no rule authoring.

## Validation Requested

- Create `.agents/skills/use-preferred-react-stack/SKILL.md`,
  `references/decision-table.md`, `references/tanstack-pacer.md`,
  `references/zustand.md`; add the reciprocal hand-off sentence to
  `manage-server-state/SKILL.md`, `build-forms/SKILL.md`, and
  `build-composable-components/SKILL.md`; bump the catalog `VERSION`.
- Verify every import path in `references/tanstack-pacer.md` against
  `@tanstack/react-pacer` `exports` for the pinned version.
- Fresh-task prompt (does not name the originating feature): "In this Next.js
  app, add a search box to the customers page. Filter as the user types, but
  wait for a pause before hitting the API. Keep the current filter in the URL
  so the page is shareable, remember the user's last sort order across reloads,
  and show a small notification if the request fails." Expected: Pacer
  debounce from `'@tanstack/react-pacer/debouncer'`, TanStack Query for the
  fetch (routed to `manage-server-state`), nuqs for the URL filter, a Zustand
  `persist` store for sort order, sonner for the error notice, no `useMemo`/
  `useCallback`, and a note that `package.json` was checked first.
