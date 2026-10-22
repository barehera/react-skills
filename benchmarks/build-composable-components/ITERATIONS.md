# build-composable-components iterations

Each entry records what ran, what the results showed, and the decisions taken
for the next variant. Scores are the blind grader's weighted rubric score
(0-100); the rubric is fixed across iterations.

## Variants

| Id | Source | Words (core / total) | Note |
| --- | --- | --- | --- |
| baseline | `main` (v2.0.1) | 1613 / 10172 | Original skill |
| lean-v1 | working tree | 1256 / 7712 | Manual pass: deduplicated rules and examples, removed generic advice, routed optimistic-mutation steps to `manage-server-state` |
| none | — | 0 / 0 | Control: no skill installed |

## it0 — baseline vs lean-v1 vs none

4 tasks × 3 variants × 2 repetitions = 24 runs, Opus 5.5 effort high,
subagent mode (subjects run with `omitClaudeMd`). Grades below are rubric v1.

| Variant | Score | Overall /10 | Context tokens / run | Minutes | Typecheck |
| --- | --- | --- | --- | --- | --- |
| baseline | 97.7 | 8.4 | 511k | 4.2 | 8/8 |
| lean-v1 | 97.4 | 8.4 | 450k | 3.7 | 8/8 |
| none | 62.7 | 5.4 | 172k | 1.9 | 8/8 |

Findings (one analyst per task, each finding checked against the code):

- **The skill is worth about 35 points.** Without it, the model fuses the
  family with the feature, hides slots behind closed components, carries copy
  in context, passes positional indexes, and styles variants through React
  context.
- **The model already knows** persistent overlay placement, instance
  isolation, a clearable controlled value (it builds controlled-only), the
  global-store bug, keeping a backlog-recorded variant, removing a test-only
  export, and most of T4 (typed API, defaults, cleanup).
- **The skill hurts in two places.** Its controlled/uncontrolled example adds
  unrequested uncontrolled machinery to every run (T2). Row 6 of the
  over-engineering test makes 3 of 4 skill runs hesitate to remove an unused
  `layout` switch the control removes (T3); the caller-count warning appears
  four times and runs quote it as the reason to hold.
- **lean-v1's T1 r2 dip is noise.** The confirm-dialog lifecycle exists in
  both variants only as a code example, never as a stated rule.
- **Contamination.** The skill's Tabs example and ReviewerPicker example are
  near copies of T4 and T2, so those tasks partly measure recall.

Measurement fixes: rubric v2 clarifies T2 `conventions` (boolean `&&`
conditions, no unrequested uncontrolled mode) and T4 `slot-mapping` (hover
not required); it0 is re-graded under v2. `skillReads` now counts shell reads
(cat, sed, loops, globs). New transfer task T5 (bulk selection toolbar) has no
counterpart in the skill's examples.

Decisions for lean-v2 (applied by the editor agent from lean-v1):

1. Keep every skill-value rule; add the reason to the DOM-first styling rule.
2. Replace the clearable-value rule with "controlled-only first; `"value" in
   props` only for dual mode"; delete the `PickerRoot` example and the
   state-and-lifecycles paragraph.
3. Rename the examples section to "Required bindings after a spread"; drop
   the duplicate indicator and `size` from the remote result example.
4. Remove the duplicate module-global store clause.
5. Merge the styling ownership rule and ladder into one DOM-propagation
   section with a generic example (no Tabs); add the CSS-variable reset reason.
6. Delete the styling sections the control already satisfies (defaults,
   variant matrix, semantics vs layout, leaf patches, child overrides,
   maintenance audit); shorten "Extend the base or the family".
7. Shorten "Structure long class lists" (the fixture confounds its measure,
   so it stays).
8. Trim the implementation notes; drop the `cloneElement` line.
9. Point the SKILL.md reference line at what remains.
10. `&&` requires a boolean condition; nullable values are compared
    explicitly. The review checklist links to the rule instead of restating it.
11. Row 5 removes an unset `mode`/`layout` switch with the private branches
    only it renders; row 6 excludes row 5 switches; the caller-count rule is
    stated once. F-001's negative control (unused variant value → `revisit`)
    is unchanged.
12. The exported-hook checklist bullet merges into the extension-point
    definition and row 2 (F-003's destination moves; re-checked in it1 by
    `keep-extension-hook`). Assumption-dependent defects are reported as risks.
13. State the confirm-dialog lifecycle as a rule with its reason.
14. Collapse the persistent-overlay section to one paragraph.

Deferred: a no-backlog copy of T3 before cutting row 3 or its example
(F-001 negative control); an ablation of `architecture-and-api.md`'s closed
results paragraph; a SKILL.md-only run to see what the core carries alone.

### it0 under rubric v2

Re-graded with the clarified rubric: baseline 97.1, lean-v1 96.3, none 63.1.
The order and gaps did not change.

Incident: the first re-grade called the saved workflow by name and ran the
version loaded at session start, which ignored the `regrade` flag. 24
subjects ran with an empty task. They changed no code but overwrote 21
reports, so those grades were discarded. Reports, rubric v1 grades, and
metrics were restored from the dashboard `data.json` (24/24 verified) and the
re-grade was repeated correctly. Guards added: `collect` refuses to rebuild a
graded run, the workflow refuses jobs without a task prompt, and the
`skill-bench` skill now calls an edited workflow by script path and checks
its journal.

## it1 — lean-v2 on T1-T4, transfer task T5

lean-v2 × T1-T4 × 2, plus T5 (bulk selection toolbar, no counterpart in the
skill's examples) × baseline, lean-v2, none × 2. Rubric v2.

| Variant | T1-T4 mean | T5 | Words | Context tokens T1-T4 / T5 |
| --- | --- | --- | --- | --- |
| baseline | 97.1 | 92.7 | 10172 | 511k / 628k |
| lean-v1 | 96.3 | — | 7712 | 450k / — |
| lean-v2 | 92.0 | 93.8 | 6834 | 432k / 409k |
| none | 63.1 | 75.0 | 0 | 172k / 269k |

- **Transfer holds.** On T5, lean-v2 matches the baseline with 35% less
  context; the skill teaches principles, not recall of its examples.
- **T2 improved** (100/100 vs 95/95) once the dual-mode example was gone.
- **T4 lost css-propagation (2/2).** Two lean-v2 sentences caused it: the
  added "a nested family root resets the variable, which group selectors do
  not" raised a leak without a DOM answer, and the context rung lost "behavior,
  not only CSS", so copying a value onto attributes passed as "JavaScript must
  read". The model's own default is context, so this rule needs its exact
  wording. `defaults-preserved` r1 is a grader inconsistency (the same rewrite
  scored 1.0 for the baseline).
- **T1 lost persistent-overlay (2/2).** Not the decision-14 cut: the gate
  sentence survived and was read. Decision 13's "so a failure appears where
  the user can retry" made both runs hoist one shared dialog above the rows,
  which then had no per-row capability to gate it. Layering r1 (0) is one
  repetition with unchanged text.
- **Lesson.** Every loss this round came from a sentence that was added or
  reworded, not from a deletion. The model follows new wording literally.

Decisions for lean-v3 (from lean-v2):

1. Confirm dialog: keep preventDefault, pending-disabled, and close-on-success;
   replace the failure clause with "report the failure from a parent that
   survives instead of hoisting one shared dialog above the items".
2. Delete the nested-root clause from the CSS-variable rung.
3. Context rung: "when JavaScript behavior, not only CSS, must read the value.
   Copying a root value onto a slot's attributes is still styling."
4. Same wording in the SKILL.md styling bullet.

Known rubric tensions, not changed now: T1 `persistent-overlay` could accept
a hoisted dialog that is still capability-gated; T4 `defaults-preserved`
could accept a base value replaced by an equal CSS-variable default.

## it2 — lean-v3 on all five tasks

| Variant | T1-T4 mean | T5 | Words | Context tokens T1-T4 / T5 |
| --- | --- | --- | --- | --- |
| baseline | 97.1 | 92.7 | 10172 | 511k / 628k |
| lean-v2 | 92.0 | 93.8 | 6834 | 432k / 409k |
| lean-v3 | **97.9** | 88.5 | 6872 | 433k / 565k |
| none | 63.1 | 75.0 | 0 | 172k / 269k |

- The four wording fixes restored T4 (100/100) and T1's overlay gating
  (persistent-overlay 1/1); T2 stays at 100/100.
- T5 at 88.5 is within noise of the baseline: the lost points are a missing
  `aria-live`/`role="toolbar"` on the toolbar (the rubric's accessibility
  criterion asks for one of them, so the grade is right), and none of the
  four edits touches it. T5 `consumer-anatomy` scores 0.5 in 5 of 6 skill runs
  because the skill's "do not mix the modes" rule disagrees with the rubric's
  preferred shape; left as an open rubric/skill tension.
- Signal to watch: T1 `layering` slipped in 2 of 4 lean-v2/lean-v3 runs (0 of 4
  for baseline and lean-v1). The failing runs put the family under
  `features/` and import mutations into family parts.

**Promoted (checkpoint).** lean-v3 replaced `skills/build-composable-components`
(`SKILL.md` and references; examples and agent metadata were identical);
`npm run skills:sync` and `npm run validate` pass. It is the checkpoint
for further cuts.

## it3 — lean-v4 (deletions + owner goals + clean-code pass)

lean-v4 = lean-v3 + 13 deletions (duplicates, model-knows text, the TaskActions
examples that showed a family calling a mutation) + the owner's goals (generic
families in `components/ui` named by UI role; record anatomy composed once in
the owning feature; repeated code extracted; call-site `className` only for
layout, component treatments as typed `size`/`variant`, primitives extended
through their existing variant definition) + a clean-code pass (shadcn naming
without a `Root` suffix, one file shape, ARIA for composite parts, generic item
types without consumer casts, a small public API). The `ReviewerPicker` example
became a generic `Combobox`; the `Roster` example moved to `components/ui` and
follows the new rules. T1 × 4, T2-T5 × 2, rubric v2.

| Variant | T1-T4 | T5 | Consistency | Words | Context T1-T4 |
| --- | --- | --- | --- | --- | --- |
| baseline | 97.1 | 92.7 | 54% | 10172 | 511k |
| lean-v3 | 97.9 | 88.5 | 59% | 6872 | 433k |
| lean-v4 | **98.5** | 86.5 | **91%** | 6177 | 530k |
| none | 63.1 | 75.0 | 83% | 0 | 172k |

Owner checks (mechanical, lean-v4 vs baseline/lean-v3):
- T2: 2/2 runs create `components/ui/combobox.tsx` +
  `features/members/components/member-combobox.tsx` (0/10 before); avatar size
  becomes an `Avatar` primitive variant (2/2, 0/4 before).
- Destructive confirm: 6/6 runs add the variant to the `AlertDialogAction`
  primitive instead of passing `buttonVariants` (0/8 before).
- T1: all 4 runs produce the same files (`components/ui/action-menu.tsx` +
  `features/tasks/components/task-actions.tsx`); T1 scores 100 ×4.
- Context grows (530k) because runs now extend primitives and create the
  generic layer; time 4.3 min.

Losses: T5 `toolbar-composition` 0.5/0.5 — the bulk delete dialog lives inside
a toolbar that unmounts when the selection empties (lean-v3 1/1; the
persistent-overlay example was deleted in lean-v4 and the rule's wording names
only menus, popovers, and sheets). T4 r1 `defaults-preserved` 0.5 is the known
grader inconsistency. Awaiting the owner's side-by-side review before the next
change; candidate fix: phrase the overlay rule as "content that can unmount".

## it4 — aggressive round: lean-v5 vs brief-v5

Two authors started from lean-v4 in parallel. **lean-v5** is a sharper rewrite
(3 references; React 19 ref-as-prop, derived state never stored, success
effects through `mutateAsync`, one controllable helper per family, overlay rule
for any conditionally rendered content, count wording through a function child,
IDs-to-root for totals, a controlled-only `Roster` example). **brief-v5** is the
video thesis taken to the limit: `SKILL.md` only — goal, layer placement,
boundaries (skill-value rules only), compact audit rules, a "done when"
checklist — plus the typed example. Both dropped the `Combobox` naming example.
T1-T5 × 2, rubric v2.

| Variant | T1-T4 | T5 | T1-T5 | /10 | Consistency | Words | Context T1-T4 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 97.1 | 92.7 | 96.2 | 8.2 | 54% | 10172 | 511k |
| lean-v4 | 98.5 | 86.5 | 96.1 | 8.2 | 91% | 6177 | 530k |
| **lean-v5** | 97.2 | **100.0** | **97.8** | **8.6** | 90% | 4456 | 502k |
| **brief-v5** | 97.2 | 96.9 | 97.1 | 8.2 | 81% | **1857** | 443k |
| none | 63.1 | 75.0 | 65.5 | 5.6 | 83% | 0 | 172k |

- Every owner check passes for lean-v4, lean-v5, and brief-v5: T2 builds
  `components/ui/combobox.tsx` + `features/members/components/member-combobox.tsx`
  without a combobox example, no domain picker in `components/`, and the
  destructive confirm and avatar size become primitive variants.
- lean-v5 fixes T5 (100/100): the overlay rule for conditionally rendered
  content and IDs-to-root resolved both T5 losses. Its new wording did not cost
  T1 or T2.
- brief-v5 keeps T1-T4 at the baseline's level with 18% of its words, which
  confirms the thesis; it loses ground on consistency (81%) — the rulebook
  still makes structure more predictable.
- T4 r1 of both variants scores 91/94 on the recurring grader inconsistency
  (`defaults-preserved` CSS-variable rewrite).

Recommendation: lean-v5 is the new best overall (highest T1-T5 and /10,
consistency within 1 point of lean-v4, 56% shorter than the original);
brief-v5 is the minimal alternative if size matters more than consistency.
Promotion awaits the owner's side-by-side review.

## it5 — lean-v6 (lean-v5 + 5 targeted fixes), only the new variant

To save tokens only lean-v6 ran (T1-T5 × 2); lean-v4 and lean-v5 results are
reused (same tasks, rubric v2, grader). Fixes, each traced to a lean-v5 loss:
the audit's step 7 reports `? : null`, non-boolean `&&`, and repeated class
patches as findings, and small findings are no longer dropped after "report
root causes" (T3 `ternary-null` 0/0 → 1/1, `leaf-size-patches`); a test-only
export is replaced by a behavior test (T3); context is limited to portaled
slots — a slot inside the root's DOM reads the root's group or variable (T4
`css-propagation`); a composition file reuses the generic role name verbatim
(T1 naming drift).

| Variant | T1-T4 | T5 | T1-T5 | /10 | Consistency | Words | Context T1-T4 | Minutes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 97.1 | 92.7 | 96.2 | 8.2 | 54% | 10172 | 511k | 4.3 |
| lean-v4 | 98.5 | 86.5 | 96.1 | 8.2 | 91% | 6177 | 530k | 4.3 |
| lean-v5 | 97.2 | 100.0 | 97.7 | 8.6 | 90% | 4456 | 502k | 3.7 |
| **lean-v6** | **100.0** | **100.0** | **100.0** | **8.7** | **91%** | 4545 | **449k** | **3.5** |

- All ten lean-v6 runs score 100; every targeted criterion recovered.
- T1 produces `components/ui/action-menu.tsx` + `features/tasks/components/task-action-menu.tsx`
  in both runs; T2 and T5 keep the owner's structure (generic `combobox`/
  `selectable-list` in `components/ui`, primitives extended for the
  destructive action and avatar size).
- The rubric is now saturated for skill variants (ceiling). Further gains need
  harder tasks or rubric v3 criteria for the owner's goals (duplication,
  typed styling, reuse), not more wording changes.

Recommendation: promote lean-v6 to `skills/build-composable-components`, update
`docs/technology-stack.md` for the `components/ui` placement decision with a
decision-ledger entry, and run `npm run validate`.

## it6 — v3.3.0 (lean-v7) vs v3.2.0 (lean-v6, reused from it5), 1 rep

v3.3.0 adds the "Smallest complete change" ladder (PR #58) and rewords the
core to stay at 219 lines. v3.2.0's SKILL.md is byte-identical to lean-v6, so
its it5 runs (same tasks, rubric v2, grader, Opus 5.5 high) are reused; only
lean-v7 ran (T1-T5 × 1). Blind pairs compare it5 lean-v6 r1 with it6 lean-v7 r1.

| Variant | T1 | T2 | T3 | T4 | T5 | T1-T5 | /10 | Words | Lines added T1/T2/T4/T5 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lean-v6 (v3.2.0) | 100 | 100 | 100 | 100 | 100 | 100.0 | 8.7 | 4545 | 391-408 / 556-636 / 24-31 / 468-507 |
| lean-v7 (v3.3.0) | 68.2 | 100 | 100 | 91.2 | 100 | 91.9 | 8.0 | 4586 | 271 / 536 / 46 / 460 |

Blind pairs (v320-vs-v330): lean-v7 3, tie 1, lean-v6 1. T1, T2 slight and T4
clear for lean-v7; T3 tie; T5 slight for lean-v6.

- T1 regression is real (grader evidence matches the code): the subject wrote
  "No new generic `components/ui` family. DropdownMenu, AlertDialog and Button
  already cover these roles" and listed the family under `Skipped:`. The
  ladder's rungs 1-2 (skip what nobody asked for; use what the repository
  already has) overrode the request "build it as a reusable component" and the
  owner's rule that generic anatomy lives in `components/ui`. Layering and
  slot-props scored 0. The blind judge preferred it for simplicity, but its
  generic quality bar contradicts the owner's stated structure, so the owner's
  rule wins.
- T4 lost `root-owned-config` (size/variant on `TabsList`, not the root); the
  judge preferred that version for nested-group isolation. Rubric vs judge
  disagree; one rep, treat as noise until repeated.
- Code size: T1 -32% (from the skipped family), T2 -4..-16%, T5 -2..-9%,
  T4 +15..+22 lines. The ladder does shrink code, but the T1 cut is the wrong
  kind.

Decision proposal (owner's call): lean-v8 = lean-v7 + one rule in the ladder:
an existing primitive (DropdownMenu, Popover) is not a reason to skip the
generic family when the task asks for reuse or two call sites share the
anatomy; the extract-once contract wins. Re-run T1 (and T4) × 1 to confirm.

## it7 — v4.0.0 (lean-v8) on rubric v3, with v3.2.0 and v3.3.0 re-graded

Rubric v3 (rubricVersion 3) aligns 17 criteria across T1-T5 with the v4
rules (docs/skill-feedback/2026-10-15-v4-ui-only-composition-decisions.md):
generic family even over an existing primitive, call sites composing record
parts, cva on the container part read through data-* group selectors, no
context for visual values, consumer-mapped lists with status parts inside the
list, no props/copy/aria on record roots. Weights and criterion ids are
unchanged; old grades are kept as `grade.rubric-v2.json`. lean-v8 ran T1-T5
× 1 (Opus 5.5 high); it6 lean-v7 and it5 lean-v6 r1 were re-graded on v3.

| Variant | T1 | T2 | T3 | T4 | T5 | T1-T5 (v3) | /10 | T1-T5 (v2) | Words | Lines added T1/T2/T4/T5 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lean-v6 (v3.2.0, r1) | 72.7 | 59.5 | 100 | 61.8 | 85.4 | 75.9 | 6.6 | 100 | 4545 | 391 / 556 / 24 / 468 |
| lean-v7 (v3.3.0) | 54.5 | 57.1 | 96.6 | 100 | 85.4 | 78.7 | 6.8 | 91.9 | 4586 | 271 / 536 / 46 / 460 |
| **lean-v8 (v4.0.0)** | **100** | **100** | 96.6 | **100** | **93.8** | **98.1** | **8.6** | — | 5694 | 434 / 353 / 39 / 662 |

- T1: lean-v8 builds `components/ui/action-menu.tsx` plus task record parts;
  both call sites compose trigger, content, actions, and dialog with their own
  copy; size is a cva on the content and the trigger uses Button `icon-lg`.
  lean-v6/v7 shipped closed `<TaskActionMenu task size onActionError />`.
- T2: lean-v8 has a generic Combobox, a `MemberComboboxItem` record part, and
  the consumer maps the members query inside the list with status parts.
  lean-v6/v7 used `items` on the root, a render-function Collection, and a
  closed `MemberCombobox` with copy and trigger props on its root.
- T4: lean-v7 and lean-v8 both put a cva on TabsList (owner's preferred shape);
  lean-v6 put string unions on the Tabs root.
- T5: lean-v8 lost half a point for skipping an empty-state part; v6/v7 kept
  early-return status states, root density, and a function-child count.
- T3 (audit): lean-v8 recommends the v4 shape but fixes the repeated item size
  patch by making it the base style, not a container cva (half credit).
- Code size: composability costs lines where call sites compose parts (T1
  +11%, T5 +41% vs v6); T2 is 37% smaller. Typecheck 5/5, 4.1 min average.

Caveats: one repetition; lean-v6 and lean-v7 were authored for rubric v2, so
their v3 scores measure distance from the owner's new shape, not regressions.
The fixture's installed VERSION reads 2.0.1 (subjects print "React Skills
v2.0.1"); harmless for grading, worth refreshing.

Decision: keep v4 (lean-v8) as the promoted variant. Next candidates if a
lean-v9 is wanted: an empty-state part in list examples, the container-cva fix
in audit recommendations (T3), and shorter T5 call sites.
