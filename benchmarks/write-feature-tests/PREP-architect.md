# write-feature-tests benchmark: architect prep

Suite: `benchmarks/write-feature-tests/suite.json` uses its own fixture,
`fixture: "fixture-write-feature-tests"`, and lists `t5-board-move` as the
transfer task. Every task uses `rubricVersion: 1`.

## Why it has its own fixture

The shared fixture can't run this skill's tasks, for three reasons:

- It has no `vitest` and no `zod`.
- Its `tsconfig.json` excludes `*.test.ts`, so tests would never be type-checked.
  A row with the wrong input type has to fail typecheck.
- It's built around UI code (Radix, cmdk). This skill tests pure rules.

`benchmarks/fixture-write-feature-tests/` is a smaller version of the same
acme-tasks app. It contains:

- Config files:
  - `package.json`, with scripts `typecheck` (`tsc --noEmit -p .`) and `test` (`vitest run`).
  - `tsconfig.json`, which includes test files and maps `@/*`.
  - `vitest.config.ts`, set to the Node environment with the `@` alias.
  - `CLAUDE.md` and `.gitignore`.
- Source files:
  - Tasks feature: `types.ts`, `policy.ts` (`canDeleteTask`, `canReopenTask`), `due.ts` (`getTaskDueTone`), `status.ts` (the product map `TASK_STATUS_TONE` and the mechanical map `TASK_STATUS_QUERY_PARAM`), plus two small components.
  - Shared code: `lib/dates.ts` and `hooks/use-viewer.ts`.
  - Every decision has a `Business Logic` / `Why` / `Rule` block.
- What it leaves out on purpose: no test runner and no tests. t1, t3 and t5 check
  whether the agent creates exactly one generic runner.

Dependencies:

- `react`, `zod` ^4.4.3, `zustand`
- dev: `vitest` ^4.1.11, `typescript` ^7.0.2, `@types/react`

Before the first run, install them once: `npm --prefix benchmarks/fixture-write-feature-tests install`.
`bench.mjs` links `<fixture>/node_modules` into each run, so it must exist. I did
not run `npm install`.

## Tasks

### t1-lock-task-rules (create)
Adds tests for `policy.ts`, `due.ts` and `status.ts` after two regressions. No overlay.

| id | weight |
| --- | --- |
| shared-runner | 3 |
| one-table-per-decision | 3 |
| row-shape | 2 |
| regression-branches | 2 |
| product-map-table | 2 |
| no-mechanical-map-test | 1 |
| no-business-logic-copy | 2 |
| scope-discipline | 1 |
| typed | 2 |
| report | 1 |

### t2-reopen-rule-change (extend)
The reopen rule changes so owners can reopen tasks archived less than 30 days
ago. CI is also red because a rename broke an import.

Overlay:
- the repo's existing runner, `src/test-support/decision-table.ts` (`checkDecision`)
- three tables: `can-reopen-task`, `can-delete-task`, and `get-task-due-tone`, which still imports the old name `dueTone`

| id | weight |
| --- | --- |
| existing-runner | 3 |
| changed-branch-row | 3 |
| other-rows-intact | 2 |
| no-loosening | 2 |
| rename-import-fix | 3 |
| business-logic-updated | 2 |
| minimal-input | 1 |
| wired-and-typed | 2 |
| report | 1 |

### t3-config-defaults (create)
Adds a safety-net contract for baked remote-config defaults, a table for
`getSubtaskLimit`, and the new `reminderLeadMinutes` setting.

Overlay:
- `src/config/remote-config.ts` (schemas, baked defaults, `loadBakedConfig`)
- `src/features/tasks/subtasks.ts`

There is one seeded trap: an orphaned `legacyDigest` key in the baked
`notifications` default.

| id | weight |
| --- | --- |
| contract-names | 2 |
| contract-keys | 3 |
| contract-loader | 2 |
| contract-separate | 2 |
| default-from-loader | 3 |
| decision-table | 2 |
| new-setting | 2 |
| orphan-key | 2 |
| no-business-logic-copy | 1 |
| typed-and-reported | 2 |

### t4-tests-audit (audit, seeded)
The agent reviews a test suite people call over-engineered and is told not to
edit anything. The prompt also asks about Sam's plan to merge the task test
files into one.

The overlay holds 11 test files, a second runner, and the extra production
files they test (`filters`, `options`, `pagination`, `config`, `subtasks`).

Seeded defects:
- the per-feature runner `runTaskTable`, with `makeTask` fixtures
- the `reopenWith` adapter that reshapes inputs
- the `includesOptionCase` adapter, which wraps a positional guard
- a duplicate `task-policy` suite
- the `DEFAULT_TASK_FILTERS` change-detector; `resetTaskFilters` is untested
- a table over the mechanical `TASK_STATUS_QUERY_PARAM` map
- a Business Logic block copied into `can-delete-task.test.ts`
- a pasted default `expected: 20` in `get-subtask-limit`

Keep-traps: the `TASK_STATUS_TONE` table, the defaults contract, the `clampPage`
library table, and the shared runner. The agent should also argue against
merging the files.

| id | weight |
| --- | --- |
| no-edits | 2 |
| second-runner | 3 |
| reshaping-adapter | 2 |
| positional-guard-adapter | 2 |
| duplicate-suite | 2 |
| change-detector-order | 3 |
| mechanical-map | 2 |
| copied-business-logic | 2 |
| literal-default | 2 |
| keep-product-map | 3 |
| keep-defaults-contract | 3 |
| keep-library-table | 1 |
| reject-merge | 3 |
| report-quality | 2 |

### t5-board-move (create, transfer)
Drag-and-drop move rules live inline in a zustand `set` callback. This task is
unlike every skill example: the agent has to extract a store transition first,
then cover it with a `{ state, move } -> next state` table.

Overlay: `src/features/board/types.ts` and `src/features/board/store/board-store.ts`.

| id | weight |
| --- | --- |
| extract-transition | 3 |
| transition-table | 3 |
| branch-rows | 2 |
| row-shape | 2 |
| shared-runner | 2 |
| file-per-decision | 1 |
| business-logic-owner | 1 |
| scope-discipline | 1 |
| typed | 2 |
| report | 1 |

## Verification

For each task I copied the fixture and the overlay into the scratch folder and
linked the repo-root `node_modules` (vitest 4.1.11, zod 4.4.3, TypeScript 7.0.2,
react, zustand). The scratch folder is deleted.

| task | typecheck | tests |
| --- | --- | --- |
| base fixture | pass | — |
| t1 | pass | — |
| t2 | 1 error, intended (`dueTone` import) | vitest fails only on that file. After a reference import fix, typecheck passes and 16/16 tests pass. |
| t3 | pass | A reference key contract catches `legacyDigest`, then passes once it is removed. |
| t4 | pass | 11 files, 42/42 tests pass |
| t5 | pass | A scratch test confirmed reject-when-full, same-column reorder at the limit, unblock in Done, and index clamping. |

All tasks are verified except one remaining step: run them once against the
real fixture `node_modules` after the install.

## Open questions

1. **Subjects can't run tests.** `bench.mjs` limits subjects' Bash to
   `npm run typecheck`, so they can't run `npm test`. The skill's step 10
   ("run the affected tests") can't be done, so criteria only ask that the
   handoff says how tests were or couldn't be run. Should this suite allow
   `Bash(npm test)`? That would need a per-suite `allowedTools` option in
   `bench.mjs`.
2. **t2 starts red on purpose.** The base workspace fails typecheck, which is
   part of the scenario. Graders see the end-state typecheck, which should pass.
3. **t3 `orphan-key` is hard to see.** Without a test run, the subject only
   finds `legacyDigest` by reasoning. Lower it to weight 1 if no variant gets
   it, including `none`.
4. **t5 overlaps other skills.** Extracting the transition and moving the
   Business Logic block are partly owned by `$extract-named-helpers` and
   `$document-business-logic`. They are weighted 3 and 1 because the skill's
   step 2 sends extraction to `$extract-named-helpers` before testing.
5. **Positional product decisions are not covered.** The skill is ambiguous
   about them, so no task depends on that rule.
