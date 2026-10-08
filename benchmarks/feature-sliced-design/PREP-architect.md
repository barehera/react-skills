# feature-sliced-design benchmark prep (architect)

Suite: `benchmarks/feature-sliced-design/suite.json` -> skill `feature-sliced-design`,
fixture `fixture` (shared acme-tasks app, unchanged), transfer task `t4-quick-switcher`.
All tasks use rubricVersion 1. Criteria were derived from the skill source
(SKILL.md core contracts, the four references, the Next.js example); `variants/`
and `results/` were not read.

## What the skill uniquely teaches (rubric targets)

Owner before technical kind; layer -> slice -> purpose segment; downward-only
dependencies and no sibling-slice imports (compose above); purpose segments
instead of components/hooks/types/utils buckets; server state colocated with
its owner, `api` vs `server-state` split; vendor SDKs in an integrations
boundary started by the app, business events owned by the feature; one typed
env boundary, no client secrets; direct public paths, no `export *` /
re-export barrels, relative same-slice imports; promote to shared only when
business-agnostic and reused (similar-looking code is not proof); preserve the
established architecture in scoped work, migrate one slice at a time, no
compatibility barrels; audit without editing, ranked by impact; completion
report with moved/unmoved files and remaining debt.

## Tasks

### t1-invite-member (create) - add a feature in an established repo
Overlay: `src/pages/dashboard/dashboard-page.tsx` (Members card),
`src/pages/project-settings/project-settings-page.tsx` (People card),
`src/components/ui/input.tsx`, `src/components/ui/label.tsx`.
Prompt: owners invite by email + role from both pages, POST
`/projects/:projectId/invitations`, refresh members, owner-only.

| id | w | checks |
| --- | --- | --- |
| slice-ownership | 3 | all invite code in one slice (members or invite-member); nothing in ui/hooks/lib/pages/global buckets |
| pages-compose | 3 | both pages render the same slice component; no form logic in pages |
| no-sibling-imports | 2 | no import of `@/features/tasks/*` (Viewer type/policy trap) |
| server-state-placement | 2 | mutation in owner server-state, `@/lib/api`, invalidates `memberKeys` inside the hook |
| policy-in-model | 2 | named owner-only rule in slice policy/model, validation with the feature |
| segments-and-anatomy | 2 | purpose segments with real content, consistent with neighbor anatomy |
| direct-paths | 2 | direct `@/` paths, no barrels, relative inside slice |
| generic-ui-boundary | 1 | any new components/ui file is business-agnostic |
| scope-discipline | 1 | no unrelated moves, no packages |
| wired-and-typed | 2 | owner gating, request shape, client email check, refresh, typecheck |
| placement-report | 1 | ownership reasoning, public path, noticed debt (use-viewer -> tasks types) |

### t2-tasks-bucket-migration (extend) - scoped vertical-slice migration
Overlay seeds global buckets: `src/hooks/use-task-filters.ts` (zustand),
`src/hooks/use-debounced-value.ts` (generic, also used by members),
`src/types/task-filter.ts`, `src/utils/format.ts` (MIXED: generic `formatCount`
+ tasks `formatTaskTitle`), `src/utils/task-helpers.ts`, `src/utils/index.ts`
(`export *` barrel), `src/constants/index.ts` (MIXED: 3 task constants + 1
member constant); consumers `features/tasks/components/task-list.tsx`,
`task-filter-bar.tsx`, `features/members/components/member-search.tsx`.

| id | w | checks |
| --- | --- | --- |
| tasks-code-colocated | 3 | store+types, helpers, task constants under features/tasks; old files deleted |
| split-mixed-modules | 3 | formatCount, useDebouncedValue, MEMBER_SEARCH_DEBOUNCE_MS NOT moved into tasks (keep-traps) |
| no-compat-barrels | 2 | no forwarding re-exports, no new barrels |
| import-direction | 2 | relative imports in slice; buckets no longer import tasks |
| scope-discipline | 2 | members untouched (except forced import paths); tasks slice not restructured (no components->ui rename) |
| behavior-preserved | 2 | identical logic/values; typecheck |
| segment-naming | 1 | model/lib/config, not features/tasks/hooks|utils|constants|types |
| migration-report | 2 | moved vs unmoved with reasons, debt, next slice |

### t3-structure-audit (audit, seeded) - known answer
Overlay seeds (all typecheck):
1. `src/config/env.ts` + `src/env.d.ts` + `src/lib/billing.ts` + `features/billing/components/upgrade-button.tsx`: `VITE_STRIPE_SECRET_KEY` used from the browser.
2. `features/tasks/components/task-assignee-field.tsx` -> members query; `features/members/components/member-workload.tsx` -> tasks query (bidirectional sibling coupling).
3. `src/components/ui/status-badge.tsx` imports TaskStatus + duplicates task labels; `src/hooks/use-viewer.ts` (fixture) and `src/lib/analytics.ts` import tasks types.
4. `features/tasks/index.ts` `export *` barrel + `task-detail-header.tsx` self-imports `@/features/tasks`.
5. `src/server-state/project-queries.ts` global dump (project + task comments, one `queryKeys`).
6. `src/store/task-store.ts` + effect in task-list mirrors query data into zustand.
7. `src/lib/analytics.ts` init at import + business rule `trackTaskCompleted`.
Keep-traps: `src/lib/date/format-relative-date.ts` (correct shared lib used by
two slices); `features/tasks/status-label.ts` vs `features/members/role-label.ts`
(look alike, must NOT be merged); no big-bang components/ui -> shared/ui demand.

| id | w |
| --- | --- |
| no-edits | 2 |
| secret-leak | 3 |
| sibling-slice-imports | 3 |
| foundation-imports-feature | 3 |
| barrel-self-import | 2 |
| global-server-state | 2 |
| zustand-mirror | 2 |
| integration-business-logic | 2 |
| keep-shared-date | 2 |
| keep-separate-labels | 2 |
| incremental-plan | 2 |
| report-quality | 2 |

### t4-quick-switcher (create, TRANSFER) - cross-feature composition
Unlike the skill's only example (Next.js widget composing two features on a
route): a global Cmd/Ctrl+K overlay in a Vite app that spans tasks + members
and drives app-shell state. Overlay: `src/app/app-shell.tsx` (open-task state),
`features/tasks/components/task-list.tsx` (adds `onOpenTask`). No Dialog
primitive exists, so the agent must decide where a generic one goes.

| id | w | checks |
| --- | --- | --- |
| composition-above-slices | 3 | switcher in app/widgets/pages; a `features/quick-switcher` or `components/...` importing features is a fail |
| feature-owned-pieces | 2 | task/member rendering stays with owners; nothing domain in ui/hooks/lib |
| generic-primitive | 2 | dialog / CommandDialog in components/ui, business-agnostic |
| app-owned-state | 2 | AppShell owns open-task + assignee filter; TaskList gets an explicit input |
| server-state-reuse | 2 | existing queries from owners; no fetching in switcher |
| shortcut-placement | 1 | listener beside owner or focused module, not src/hooks dump |
| direct-paths | 2 | no barrels, alias across slices, relative inside |
| scope-discipline | 1 | no wholesale restructure, no packages |
| wired-and-typed | 2 | shortcut, task open, member filter + clear, cmdk filtering reconciled, typecheck |

### t5-tag-manager (create) - vendor integration + runtime boundaries
Overlay: `src/env.d.ts` (`VITE_GTM_ID?`), `src/app/consent.ts`
(hasAnalyticsConsent/onConsentChange), `src/app/app.tsx`, and task-list /
task-detail-header with duplicated inline Rename/Delete (tempts per-component
tracking).

| id | w | checks |
| --- | --- | --- |
| integration-boundary | 3 | one vendor-named GTM module, narrow API, no feature imports/event names |
| app-starts-integration | 2 | app layer loads after consent, once, no import-time side effect |
| feature-owns-events | 3 | event names/payload in tasks slice, fired once per action (mutation onSuccess), not on optimistic onMutate |
| env-boundary | 2 | one typed read of VITE_GTM_ID, missing -> no-op |
| no-global-buckets | 1 | no src/analytics, events catalog, barrels |
| dependency-direction | 2 | integration imports nothing above; features don't import src/app |
| scope-discipline | 1 | no packages, cache behavior unchanged |
| wired-and-typed | 2 | standard GTM snippet behavior, typed dataLayer, typecheck |

## Packages needed

None. All five tasks run on the shared fixture as installed (React 19, TS,
TanStack Query, zustand, cmdk, radix-ui incl. Dialog/Label). `import.meta.env`
typing is supplied per task by an overlay `src/env.d.ts` (vite is not
installed in the fixture). No Next.js fixture was created; see open questions.

## Verification

Each task: fixture copied without node_modules + overlay into
`scratchpad/prep/feature-sliced-design/<id>`, node_modules junctioned,
`tsc --noEmit -p .` run.

| task | typecheck |
| --- | --- |
| t1-invite-member | OK |
| t2-tasks-bucket-migration | OK |
| t3-structure-audit | OK |
| t4-quick-switcher | OK |
| t5-tag-manager | OK |

Junctions were removed with `rmdir` before deleting the scratch folder; the
fixture's node_modules is intact. The shared fixture was not modified.

## Open questions

1. Next.js coverage: the skill has a large Next.js / SSR / Server Actions
   surface (`src/_app`, `src/_pages`, thin routes, `.server.ts` actions). It is
   untested here because the only example is Next.js (in-distribution) and the
   fixture has no `next`. If wanted, add a `fixture-feature-sliced-design`
   Next App Router app (needs `next` installed) and a sixth task such as
   "add a Server Action-backed invite flow".
2. The fixture's own convention (`features/<noun>/components`, `src/hooks`,
   `src/lib`) is not canonical FSD. Rubrics deliberately reward preserving it
   in scoped work and penalize big-bang restructuring; confirm that matches the
   owner's intent (the alternative is to reward `ui/` segments and `shared/`).
3. t1 accepts both `features/members/...` and a new `features/invite-member/...`
   slice; a new slice that deep-imports `memberKeys` gets partial credit unless
   the report calls the dependency out. Confirm that tolerance.
4. t4 marks a new `features/quick-switcher` slice importing both features as a
   fail (strict FSD sibling rule); `none` agents will likely do this, which is
   the intended signal, but it is a strong call.
5. t3 has 12 criteria; trim if grading cost matters (candidates:
   integration-business-logic, zustand-mirror).
