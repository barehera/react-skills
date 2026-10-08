# use-preferred-react-stack benchmark prep (architect)

## What the skill uniquely teaches (basis for the rubric)

- Read package.json/lockfile/config first; an installed dependency is not proof it is configured (e.g. NuqsAdapter not mounted).
- One owner per concern: Pacer for repeated timing (not lodash/custom timers; one-shot `setTimeout` is fine), Query owns request retries, nuqs owns URL state (no Zustand mirror), Zustand for shared reactive client state (not for stable context/local state), sonner for transient notices (one owner, stable id, visible error kept).
- Verified import paths (Pacer subpaths `debouncer`, `rate-limiter`; nuqs `adapters/react` for a Vite SPA, not `next/app`).
- Zustand scope: `createStore` + provider + `useStore(selector)` for repeated instances; `create` singleton only for intentionally app-wide state; `initialState` + named `reset`; `persist` + `partialize` only for durable prefs/ids; never persist fetched snapshots or pending flags; resolve persisted ids against fresh data; account-scoped storage key.
- Rate limiter budget created once for call sites sharing it; frontend limiter is not server enforcement.
- React Compiler enabled: no routine memo; do not mass-remove legacy memo.
- Preserve incumbents (fetch-based transport) and do not migrate unrelated code.

## Fixture

New dedicated fixture: `benchmarks/fixture-use-preferred-react-stack/` (suite.json points at it).
It is a copy of the shared `fixture/` with these differences, all needed because the installed
package set is itself the subject of this skill and the subject agents are told not to install packages:

- `package.json` adds `@tanstack/react-pacer` `^0.18.0` (version the skill's import map was verified against; latest is 0.24.1), `nuqs` `^2.10.1`, `sonner` `^2.0.8`.
- `src/components/ui/input.tsx` (shadcn Input) and `src/components/ui/sonner.tsx` (shadcn Toaster wrapper without next-themes).
- `src/app/providers.tsx` mounts `<Toaster />` (reuse test). NuqsAdapter is deliberately NOT mounted (configure-vs-installed test).
- `Task` gains `createdAt: string` (needed for "Newest first" in t2).
- `src/features/tasks/components/tasks-page.tsx` (simple page rendering TaskList; used by t1 and t2).
- CLAUDE.md is identical to the shared fixture's (does not name Pacer/nuqs/sonner, so the `none` control must discover them from package.json).
- No `package-lock.json` and no `node_modules` yet.

The shared fixture was not modified (adding packages there would change the installed stack seen by the build-composable-components runs).

## Packages needed

Run `npm --prefix benchmarks/fixture-use-preferred-react-stack install` once before benchmarking.
New compared with the shared fixture: `@tanstack/react-pacer`, `nuqs`, `sonner`.
Not needed: react-hook-form, zod, @hookform/resolvers, axios, vitest, next, next-intl, @t3-oss/env-nextjs.
Export paths confirmed from the npm registry: Pacer 0.18.0 has `./debouncer` and `./rate-limiter`; nuqs 2.10.1 has `./adapters/react`.

## Tasks

### t1-shareable-filters (create)
Search box + status filter on TasksPage; shareable link; Back undoes filter changes but not keystrokes; no request per keystroke. Overlay: `keys.ts` (adds `filteredList`) and `use-tasks-query.ts` (accepts `{ search, status }`, keepPreviousData).

| id | w |
| --- | --- |
| url-single-owner | 3 |
| nuqs-adapter | 2 |
| typed-parsers | 2 |
| history-mode | 2 |
| pacer-debounce | 3 |
| query-boundary | 2 |
| proportional-state | 1 |
| layering | 2 |
| handoff | 1 |
| wired-and-typed | 2 |

### t2-panel-view-preferences (create)
Two dashboard TaskPanels; per-panel Hide done + sort + open-task highlight, remembered across reloads, independent panels, per-person on a shared computer, Reset view; TasksPage keeps working. Overlay: `features/dashboard/components/dashboard-page.tsx`, `features/tasks/components/task-panel.tsx`.

| id | w |
| --- | --- |
| store-scope | 3 |
| persist-partialize | 3 |
| persisted-id-resolution | 2 |
| account-scoped-key | 2 |
| reset-action | 2 |
| narrow-subscriptions | 1 |
| optional-provider | 2 |
| layering | 2 |
| conventions | 1 |
| wired-and-typed | 2 |

### t3-nudge-rate-limit (create, TRANSFER)
"Nudge assignee" button in rows and detail header; 3 per task per 10 minutes, shared between row and header; toast on success; tell when they can retry. Unlike any skill example (examples only debounce/persist/URL). Overlay: `use-nudge-assignee-mutation.ts`.

| id | w |
| --- | --- |
| pacer-rate-limiter | 3 |
| shared-budget | 3 |
| limit-feedback | 2 |
| notifications | 2 |
| query-boundary | 2 |
| single-feature-hook | 2 |
| client-only-note | 1 |
| permissions | 1 |
| conventions | 1 |
| wired-and-typed | 2 |

### t4-board-stack-audit (audit, seeded, known answer)
Review `src/features/board`, no edits, prioritized findings; `docs/board-notes.md` holds complaints BOARD-7/9/12/14, done BOARD-3, and unreviewed proposals P1-P3.
Seeded defects: Zustand + two-way history sync mirroring URL (BOARD-7); Query data and isFetching copied into a persisted store without partialize (BOARD-14); `withRetry` inside queryFn stacked on Query retries (BOARD-12); toast effect per observer in a hook used by three columns, empty columns on error (BOARD-9); ref+setTimeout debounce without unmount cleanup; routine useMemo/useCallback.
Keep-traps: `useFlash` one-shot timeout (P3), fetch transport vs Axios (P2), ViewerContext vs Zustand (P1), app-wide persisted collapsed-columns singleton (BOARD-3).

| id | w |
| --- | --- |
| no-edits | 2 |
| url-mirror | 3 |
| persisted-snapshot | 3 |
| retry-layers | 3 |
| toast-per-observer | 3 |
| hand-rolled-debounce | 2 |
| routine-memo | 1 |
| keep-one-shot-timeout | 2 |
| keep-transport | 2 |
| keep-viewer-context | 2 |
| keep-collapsed-store | 2 |
| report-quality | 2 |

suite.json: `{"skill":"use-preferred-react-stack","title":"Use Preferred React Stack","fixture":"fixture-use-preferred-react-stack","transferTasks":["t3-nudge-rate-limit"]}`

## Verification

Each workspace = new fixture + task overlay, `node_modules` junctioned from the shared fixture (which lacks the three new packages), `tsc --noEmit -p .`:

| workspace | result |
| --- | --- |
| fixture alone | only TS2307 `sonner` (ui/sonner.tsx) |
| t1 | only TS2307 `sonner` |
| t2 | only TS2307 `sonner` |
| t3 | only TS2307 `sonner` |
| t4 | only TS2307 `sonner` (ui/sonner.tsx, board/hooks/use-board-tasks.ts) |

No other type errors, so every overlay is sound apart from the missing package. All four tasks are marked **verify after install**: run `npm install` in the new fixture and re-run `npm run typecheck` on fixture + each overlay (expect 0 errors). All task.json and suite.json files parse. Scratch folder deleted (junctions removed first; shared fixture node_modules intact).

## Open questions

1. Pacer version: pinned `^0.18.0` to match the skill's verified import map. Pinning the latest (0.24.1) would test the skill's "recheck when the installed version differs" rule, but adds API drift noise. Keep 0.18 unless that drift is wanted.
2. The suite needs its own fixture install (`npm install` in `fixture-use-preferred-react-stack`). It is not committed with a lockfile yet. The orchestrator should generate one so the agent's "read the lockfile" step has something to read.
3. bench.mjs `prepareWorkspace` writes `.claude/skills/VERSION` as `2.0.1`; the skill reads `../VERSION`, so this works. No rubric points are given for the version line.
4. Next.js-only concerns (next-intl, T3 Env, App Router nuqs adapter, SSR hydration) are not covered: they would need a Next fixture. t1 checks the opposite: no Next adapter is retrofitted into a Vite SPA.
5. t2 `store-scope` gives full credit only to a per-panel Zustand store. Lifted state with hand-written localStorage gets partial credit at most. This is deliberate (shared reactive + persisted state belongs to Zustand in this catalog), but it is the most opinionated criterion.
6. Possible fifth task if more Pacer coverage is wanted: inline title autosave in TaskDetailHeader (useDebouncer flush on blur/Enter, cancel on Escape, sonner on failure, visible error state).
