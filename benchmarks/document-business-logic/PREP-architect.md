# document-business-logic: benchmark suite (architect report)

Suite: `benchmarks/document-business-logic/suite.json`, fixture `fixture`
(shared acme-tasks app, unmodified). Five tasks, rubricVersion 1. Transfer task:
`t5-reassign-lock-tr`. Nothing under `variants/` or `results/` was read.

## What the skill uniquely teaches (rubric targets)

1. Default to no comment; obvious derived values never get a block.
2. One `Business Logic` / `Why` / `Rule` JSDoc block, three single English
   sentences, at the owning declaration (never inline in a body or JSX).
3. `Why` only from supplied evidence (prompt, docs, existing product comment);
   when it is missing, ask instead of inventing it from code mechanics.
4. Remove narration, history, disabled code, and CSS/transport stories in the
   edited scope; replace a rambling product essay with one block (never keep both).
5. Preserve license headers, suppressions, accessibility notes, section labels,
   and public API docs.
6. Clean only the files in scope; product rules live in the feature layer.
7. English comments even when the conversation is in another language.

## Tasks

### t1-rename-lock (create, no overlay)
Rename button in `TaskDetailHeader`; user supplies a done-task lock with its
reason (invoice matching) and says "document that rule".
| id | w |
| --- | --- |
| single-block-at-owner | 3 |
| supplied-rationale | 3 |
| block-format | 2 |
| obvious-uncommented | 2 |
| feature-layer | 2 |
| placeholder-replaced | 1 |
| scope-discipline | 1 |
| wired-and-typed | 2 |

### t2-status-transitions (extend, ask-before-inventing)
Overlay `src/features/tasks/status-transitions.ts` with three non-obvious
transition rules and no rationale anywhere. Prompt: "document the business logic".
Correct behavior: name the rules and ask for the product reason; write no block
with an invented Why.
| id | w |
| --- | --- |
| asks-for-missing-why | 3 |
| no-invented-why | 3 |
| identifies-rules | 2 |
| no-narration | 2 |
| planned-shape | 1 |
| behavior-unchanged | 1 |

### t3-comment-audit (audit, seeded, no edits)
Overlay `src/features/tasks/components/task-row.tsx` plus
`docs/product-rules.md` (PR-4, PR-7, PR-9). Seeds:
remove: `// get the viewer`, ACME-212 history, `window.confirm` event-loop
narration, Safari/opacity invented Why, headings block on `isDoneStatus`,
commented-out Duplicate button. Rewrite: the "ok so this part is important!!!"
essay -> one block with the PR-7 Why (uninvoiced billable hours), not the
timer/404 story. Keep traps: license header, eslint-disable with reason,
sr-only accessibility note, section labels, `onDelete` JSDoc.
| id | w |
| --- | --- |
| no-edits | 2 |
| rewrite-in-progress-essay | 3 |
| block-at-owner | 2 |
| remove-history | 2 |
| remove-narration | 2 |
| invented-technical-why | 2 |
| remove-obvious-block | 2 |
| keep-license-and-suppression | 2 |
| keep-a11y-labels-api-doc | 2 |
| report-quality | 2 |

### t4-card-duplicate (extend, cleanup while editing)
Overlay `task-card.tsx` (narration, a PRD-31 essay with history, an
accessibility note, a TODO placeholder) and sibling `task-board-column.tsx`
(its own narration, out of scope). Prompt only asks for a Duplicate button;
the skill should proactively replace the essay with one block, strip narration
in the edited component, keep the a11y note, and leave the sibling untouched.
| id | w |
| --- | --- |
| essay-replaced | 3 |
| block-placement | 2 |
| narration-removed | 2 |
| keep-a11y-note | 1 |
| no-new-comments | 2 |
| scoped-cleanup | 2 |
| wired-and-typed | 2 |

### t5-reassign-lock-tr (create, transfer)
Turkish request: editors cannot reassign tasks due within 48 hours (SMS
reminder / conflicting customer messages); only owners can. Overlay adds
`dueAt: string | null` to `Task` (with a public-field JSDoc). Unlike the skill
example (a Confirm button component in English): a policy function plus a
named constant, a non-English conversation, and a field component that must
stay uncommented.
| id | w |
| --- | --- |
| english-block | 3 |
| owner-placement | 3 |
| supplied-rationale | 2 |
| obvious-uncommented | 2 |
| single-source | 1 |
| wired-and-typed | 2 |

## Packages

None beyond the shared fixture. No tests are needed (the fixture excludes
`*.test.tsx` from typecheck anyway).

## Verification

Each task was copied (fixture without node_modules + overlay) into the
scratchpad, node_modules junctioned, and `npm run typecheck` run: all five
pass at their starting state. A reference solution for t5 (`canReassignTask`
in policy.ts with one block, wired into `TaskAssigneeField`) also typechecks,
confirming the `dueAt` overlay is usable. Junctions were removed before the
scratch folder was deleted; the fixture's node_modules is intact.

## Open questions

1. t2 rewards asking instead of writing. In headless `claude -p` runs nobody
   answers, so the final message is the deliverable; graders must read it.
   A `none` run that writes plausible JSDoc will score low by design.
2. t1 `scope-discipline` allows adding a `Rule` line to the existing
   `canDeleteTask` block (it lacks one) but fails rewriting its Why. Confirm
   that is the wanted boundary.
3. t3/t4 block placement: a block above an in-body `const` is scored partial
   (t3) or fail (t4) because the skill says "owning declaration" and "not
   between statements". If the owner considers an in-body const an owning
   declaration, relax `block-at-owner` / `block-placement`.
4. The skill's Version step ("React Skills v<version>" in the handoff) is not
   scored; it carries no code-quality signal and variant snapshots may not
   ship `VERSION`.
5. Five tasks; if run cost matters, t4 overlaps most with t3 and t1 and is the
   first to drop.
