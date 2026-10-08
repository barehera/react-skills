# extract-named-helpers benchmark prep (architect)

Suite: `benchmarks/extract-named-helpers/suite.json`. It uses the shared `fixture`, and the transfer task is `t4-progress-steps`.
Every rubric is `rubricVersion: 1`. The rubrics come from the current skill source: SKILL.md, the references, and the examples.

## Tasks

### t1-project-summary (extend): weight 20
`ProjectSummaryCard` has a chain of filters, narration comments and an inline overdue rule. `TaskList` has a copy of the same rule.
The overlay adds `Task.dueDate` and an existing domain module `features/tasks/task-status.ts` that exports `taskStatusLabel` and `isTaskDone`.
It also adds a non-empty archive rule that carries a SUP-88 rationale comment.

| id | w | checks |
| --- | --- | --- |
| single-overdue-rule | 3 | one named predicate used by both components, reuses isTaskDone |
| domain-placement | 3 | exported from task-status.ts (or a cohesive tasks module), not lib/components/helpers.ts |
| private-single-use | 2 | summary-only helpers are module-private, with no speculative exports |
| hidden-derivation-named | 2 | the next-due chain is named, absence is explicit, the `as string` cast is gone, nothing is mutated |
| nonempty-archive | 3 | empty projects still cannot archive, and the SUP-88 rationale survives |
| keep-flat-inline | 2 | isOwner/showEmpty/canArchive stay locals, with no wrapper, hook, or memo |
| signatures | 2 | takes the task or a Pick plus an explicit `today`, and the prefix matches the contract |
| narration-removed | 1 | narration comments are deleted |
| behavior-and-typecheck | 2 | output is unchanged and the project typechecks |

### t2-task-filters (extend): weight 20
`useTaskFilters` contains inline parsing of localStorage, a branching updater for the status toggle, and a matching rule.
`TaskFilterBar` has a nested ternary and an if/else chain that maps the assignee filter to the select value.
A small new feature is added: a "Reset filters" button that keeps the search text. The trap is that `null` means unassigned and `undefined` means any assignee.

| id | w | checks |
| --- | --- | --- |
| pure-module-scope | 3 | parse, toggle and match are pure functions at module scope, and the hook still owns state and the effect |
| functional-updater | 3 | updaters still receive `previous`, so there is no stale snapshot |
| null-vs-undefined | 3 | the distinction is preserved in parse, match, the select mapping and reset |
| toggle-semantics | 2 | the last missing status still collapses to [], the transform returns a copy, and its name is to/with |
| reset-feature | 2 | the button shows only when a status or assignee filter is set, keeps the query, and persists |
| select-mapping | 2 | a named two-way mapping that stays module-private in the filter bar |
| no-hook-or-memo-wrappers | 2 | no new hook or memo, and the effect deps are unchanged |
| placement | 2 | module-private, with no helpers.ts and no move to lib |
| typecheck | 1 | wired up and typechecks |

### t3-helpers-audit (audit, no edits): weight 25
The seeded files are `task-utils.ts`, `lib/helpers.ts` (which imports from features), `use-is-task-stale.ts`, consumers, and `docs/backlog.md`.
The backlog contains BUG-212, CAL-2, MEM-4, and TASK-40 as a distractor.

| id | w | known answer |
| --- | --- | --- |
| no-edits | 2 | |
| mutating-sort | 3 | `getSortedTasks` sorts the query cache in place, so it should sort a copy |
| empty-project-complete | 3 | `isProjectComplete` is vacuously true for an empty list, which causes BUG-212 |
| stale-rule-placement | 2 | `isTaskStale` is a product rule in lib and creates an upward import, so it should move into the tasks feature |
| hook-wrapper | 2 | `useIsTaskStale` wraps a pure call, so it should become a plain call with `now` passed in |
| keep-sort-param | 2 | keep exported in lib because of the wire contract and MEM-4 (trap) |
| keep-reopen-rule | 2 | keep, because the Business Logic product rule has one caller (trap) |
| keep-due-label | 2 | keep exported because of the CAL-2 record (trap) |
| inline-restatements | 2 | inline `isEmpty` and remove the `isCompleted` alias |
| narrow-export | 1 | drop `export` from `getStatusRank` |
| revisit-title | 1 | `getTaskTitle` should be revisit or keep, not deleted on caller count |
| no-false-positives | 1 | |
| report-quality | 2 | |

### t4-progress-steps (extend, transfer): weight 18
This tests the generic family layer, which no skill example covers.
`progress-steps.tsx` repeats `step < currentStep` comparisons in three parts. `TaskStatusSteps` maps status with let/if/else, where done maps past the last index. `OnboardingProgress` derives its own current step.
The feature: skipped steps show a muted dash, and the connector line must not change.

| id | w | checks |
| --- | --- | --- |
| single-step-state | 3 | one module-scope state helper or one step boundary, so the comparisons are written once |
| family-layer-clean | 3 | no feature imports, `skipped` is a generic input, and the helper stays in the family file |
| connector-unchanged | 3 | the line after a skipped step that comes before the current step stays primary (trap) |
| skipped-rendering | 2 | dash indicator, and everything else unchanged |
| status-lookup | 2 | a `Record<TaskStatus, number>` lookup with done mapped to 3; mapping done to 2 fails |
| no-false-merge | 2 | the onboarding and task mappings are not merged |
| private-and-proportional | 2 | private helpers, no new hooks, memo, or files |
| typecheck | 1 | |

## Packages
None needed. All four tasks use only the shared fixture: React 19, TanStack Query, lucide-react, radix-ui, and cva.
The overlays only add or replace files under `src/` and `docs/`. The shared fixture was not modified.

## Verification
I copied each task into scratch with the fixture (without node_modules) plus its overlay, linked node_modules with a junction, and ran `tsc --noEmit -p .`.
All four exited 0. A seeded type error was reported correctly, which confirms the check actually runs.
The scratch folder was deleted after removing only the junctions, and the fixture's node_modules is intact.

## Open questions
- The fixture tsconfig uses `lib` ES2022, so `toSorted` is unavailable. The t3 rubric accepts `[...tasks].sort`, and t1 avoids needing it.
- The skill requires `React Skills v<version>` in the handoff. This is not graded, because the `none` variant cannot satisfy it.
- t2 and t4 are somewhat larger than the composable-suite tasks; each is about 6 to 7 minutes. If runs time out, trim the t2 filter bar mapping (select-mapping, w2).
- t1 `domain-placement` accepts "another cohesive tasks module" as well as task-status.ts. Graders may disagree on edge names such as `task-schedule.ts`.
- t4 `connector-unchanged` is a subtle trap. If the `none` and skill variants both fail it, check whether the prompt wording ("the line after each step stays exactly as it is") is clear enough before blaming the skill.
