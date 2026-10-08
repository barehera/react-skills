# manage-server-state benchmark suite: architect prep

## Design choices

- Fixture: the shared `benchmarks/fixture` (acme-tasks). No new fixture and no
  new packages are needed.
- The fixture's server state uses a fetch `api` wrapper, handwritten types,
  `taskKeys` typed key functions, inline `useQuery` hooks, and no zod, axios,
  or Query Key Factory. That matches the skill's main claim: keep the
  project's facts (transport, key pattern, layout) and enforce correctness
  (complete keys, backend-shaped pagination, targeted cache effects,
  evidence-honest contracts). It does not match the reference example's
  stack. Tasks reward adapting to the project and penalize copying the
  example's stack.
- Runs are headless and nobody can answer questions. So every task ships its
  contract evidence as `docs/api/*.md` in the overlay. Grading checks honest
  modeling and the final report, not whether the agent asked questions.
- Criteria avoid penalizing either valid convention: option factories or
  inline hooks, positional or object inputs, a new `comments` feature or code
  under `tasks`. They grade the invariants instead.

## Tasks

### t1-task-comments: create (data layer only)
Overlay: `docs/api/comments.md`, plus `Task.commentCount` added to
`types.ts`, `task-list.tsx`, and `task-detail-header.tsx`. Traps:
- The samples show undocumented `editedAt: null`, `source: "web" | "email"`,
  and `attachments: []`.
- The response is a cursor envelope `{ comments, nextCursor }`.
- The comment count is shown in two other caches.

| id | w |
| --- | --- |
| contract-honesty | 3 |
| backend-pagination | 3 |
| key-design | 2 |
| transport-reuse | 2 |
| count-consistency | 3 |
| comments-cache-effects | 2 |
| placement-naming | 2 |
| mutation-inputs | 1 |
| evidence-report | 2 |
| typed | 1 |

Total weight 21.

### t2-task-filters: extend
Overlay: `docs/api/tasks.md` (status, assigneeId with `none`, search) and a
new `project-tasks-page.tsx` parent. The main trap: the existing optimistic
`useDeleteTaskMutation` writes the exact key `taskKeys.list(projectId)`, so
once keys carry filters, instant delete silently stops working in filtered
views.

| id | w |
| --- | --- |
| key-completeness | 3 |
| prefix-hierarchy | 2 |
| optimistic-all-variants | 3 |
| request-encoding | 2 |
| previous-results | 1 |
| api-compat | 2 |
| typed-filters | 1 |
| wired-and-typed | 2 |

Total weight 16.

### t3-notifications-audit: audit, seeded, known answer
Overlay:
- `docs/api/notifications.md` and `docs/backlog.md` (NOTIF-3/5/7 symptoms)
- `src/hooks/use-session.ts`
- `src/features/notifications/{types.ts, server-state/{keys,api}.ts, queries/*, mutations/*, components/*}`

Seeded defects, with each one's location:
1. The unread-count key has no projectId (NOTIF-3), and the list key has no
   filter. `keys.ts`, `use-unread-count-query.ts:12`,
   `use-notifications-query.ts:18`.
2. The finite and infinite queries share `notificationKeys.list(projectId)`.
   `use-notifications-query.ts:18`, `use-notifications-feed-query.ts:13`.
3. Pagination uses page numbers but the contract is cursor-based.
   `api.ts:39`, `use-notifications-feed-query.ts:17`.
4. `parseNotification` throws on an unknown type, and the type is a closed
   union (NOTIF-5). `api.ts:20`, `types.ts:1`.
5. `enabled`-only auth gating plus `refetch()` on Refresh sends a request
   while signed out (NOTIF-7). `notification-bell.tsx:41`.
6. A `Partial<UseQueryOptions>` override is spread last and can replace the
   key, queryFn, or auth gate. `use-notifications-query.ts:13,21`.
7. One page-shaped updater runs through `setQueriesData` on the `all`
   prefix. It hits the infinite `{pages}` cache and the `{count}` cache and
   crashes. `use-mark-notification-read-mutation.ts:18`.
8. The optimistic update has no `cancelQueries`.
9. `invalidateQueries()` runs with no filter. `:36`.
10. A component writes a literal key `["notifications","unread"]` that
    matches no real key. `notification-bell.tsx:52`.

Keep-traps:
- Keep the fetch transport and key pattern; don't migrate libraries.
- Keep the separate unread-count endpoint; don't derive it from pages.
- Mark-all-read's targeted invalidations are fine.

| id | w |
| --- | --- |
| no-edits | 2 |
| key-missing-inputs | 3 |
| finite-infinite-collision | 3 |
| backend-pagination | 2 |
| drift-throws | 3 |
| auth-refetch | 2 |
| override-replaces-identity | 2 |
| optimistic-shape | 2 |
| cancel-before-snapshot | 1 |
| broad-invalidation | 2 |
| component-cache-write | 2 |
| keep-transport | 2 |
| keep-unread-count-endpoint | 2 |
| keep-mark-all-effects | 1 |
| report-quality | 2 |

Total weight 31.

### t4-project-export: transfer
This task is unlike every skill example. It covers background job polling,
seeding the detail cache from a 202 response, and syncing a list when the
job reaches a final status. Overlay: `docs/api/exports.md` and a
`features/projects/components/project-header.tsx` placeholder.

| id | w |
| --- | --- |
| polling-policy | 3 |
| seed-detail | 2 |
| list-sync | 2 |
| key-design | 2 |
| contract-fidelity | 2 |
| server-vs-local-state | 2 |
| layering | 2 |
| ux-states | 1 |
| wired-and-typed | 2 |

Total weight 18.

`suite.json` is `{ skill: "manage-server-state", title: "Manage Server State",
fixture: "fixture", transferTasks: ["t4-project-export"] }`.

## Packages needed

None. Every task runs with what the shared fixture already has:
`@tanstack/react-query`, the fetch `api` wrapper, radix-ui, cmdk, and
lucide. The fixture's CLAUDE.md says not to install packages, so an agent
that adds zod or axios fails typecheck. That is intended, because the skill
says not to force zod or axios onto a project.

## Verification

For each task I copied the fixture (without node_modules) plus its overlay
into scratch, junctioned `node_modules`, and ran `npm run typecheck`:

| task | result |
| --- | --- |
| t1-task-comments | pass |
| t2-task-filters | pass |
| t3-notifications-audit | pass (seeded defects are runtime and logic bugs, not type errors) |
| t4-project-export | pass |

- A sanity check confirmed that typecheck does catch an injected error.
- The scratch folder was deleted. The junctions were removed first, and the
  fixture's `node_modules` is intact.
- All task.json files parse.
- No task is marked "verify after install".

## Open questions

1. The skill's "create from scratch" path (fresh axios + zod + Query Key
   Factory stack, like the reference example) is not benchmarked. That would
   need a fixture with those packages and no server-state layer. Do we want a
   fifth task with a `fixture-manage-server-state`?
2. Headless runs cannot test the skill's question policy (ask for missing
   contract evidence before probing) or the runtime-probing safety rules. The
   tasks only check that the agent doesn't invent contract facts and reports
   evidence quality. Is a "no docs supplied" task wanted? Its pass condition
   would be a report or question rather than code.
3. t3 is long (15 criteria and 10 seeded defects). If grader noise is high,
   merge `cancel-before-snapshot` into `optimistic-shape`, and
   `keep-mark-all-effects` into `report-quality`.
4. t4 is the largest create task: two queries, one mutation, and UI. If runs
   go over about 5 minutes, drop the recent-exports list from the prompt and
   remove `list-sync`.
5. The skill asks for `React Skills v<version>` in the handoff. It is not
   graded, because it is not a code-quality signal. Add a weight-1 criterion
   if you want it tracked.
