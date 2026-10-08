# October 8 2026 decisions

## Source and evidence

- The repository owner's stated quality bar: the same request produces the
  same structure; generic components live in `components/ui` and are named by
  UI role; domain specifics live in `features/<feature>`; no repeated code;
  typed `size` and `variant` instead of call-site `className` patches.
- The benchmark loop in [`benchmarks/`](../../benchmarks/README.md): headless
  subagents (Opus 5.5, effort high) solve four or five tasks per skill in an isolated fixture app
  with each skill variant installed, a no-skill control, and blind graders.
  Every round, finding, and decision is in
  [`benchmarks/build-composable-components/ITERATIONS.md`](../../benchmarks/build-composable-components/ITERATIONS.md);
  the general lessons are in [`benchmarks/LESSONS.md`](../../benchmarks/LESSONS.md).

## Decisions

| Decision | Destination | Evidence |
| --- | --- | --- |
| Generic families live in `components/ui/<role>.tsx`, named for their UI role; a composition for one record type lives in `features/<feature>/components/<record>-<role>.tsx` and reuses the role name | `docs/technology-stack.md` layer table and rules; `build-composable-components` decision defaults; the `Roster` example moved to `components/ui` | Owner decision; with the rule, every run builds `components/ui/combobox.tsx` + `features/members/components/member-combobox.tsx` (0 of 10 runs before) and structural consistency rises from 54% to 91% |
| Replace `build-composable-components` with the benchmarked lean-v6 | `skills/build-composable-components` (`SKILL.md`, three references, example) | 4,545 words against 10,172; rubric score 100 on all ten runs (original 96.2); blind pairwise judge preferred lean-v6 over the original in 9 of 10 pairs (6 clear, 3 slight) |
| Replace the other eight skills with lean-v1 drafts: each written from [LESSONS.md](../../benchmarks/LESSONS.md) by an author that never saw the benchmark tasks, keeping every contract and example and merging overlapping references | `skills/<skill>/SKILL.md` and references for build-forms, document-business-logic, evolve-skills-from-feedback, extract-named-helpers, feature-sliced-design, manage-server-state, use-preferred-react-stack, write-feature-tests | 25-38% fewer words per skill. One benchmark repetition (baseline / lean-v1 / no skill): build-forms 95.2 / 96.9 / 77.1, document-business-logic 100 / 100 / 68.6, extract-named-helpers 92.9 / 95.0 / 88.5, manage-server-state 89.6 / 89.6 / 82.3. The other four were not measured; the owner stopped the second wave to save tokens |
| `build-forms` moves its generic Form, compound-field foundation, and field families from `features/form` to `components/ui` | `build-forms` text and `typed-feature-form` example | Same placement rule as the composable families above |
| A family never calls a mutation; call-site `className` is for layout only and component treatments are typed variants added to the primitive's existing variant definition | `build-composable-components` core contracts | Destructive confirm and avatar size become primitive variants in every lean-v4+ run (0 of 12 before) |

## Preserved

Feedback decisions F-001 to F-003 (2026-09-29) keep their outcomes: the
extension-point definition, the ordered decision test, row 5's switch rule,
row 6 for unused variant values, narrow before deleting, and "a low caller
count is never the verdict". The audit task (T3) scores 100 with lean-v6.
The extract-named-helpers audit outcomes from 2026-09-29 (keep, inline,
narrow, `revisit`, the `getItemCount` counterexample) moved from the deleted
`extraction-triggers.md` into its `SKILL.md`.

## Known gaps and follow-ups

- The blind judge preferred the original on edge-case correctness in 5 of 10
  pairs; lean-v6 wins on reuse, design-system fidelity, and simplicity. This is
  the next improvement target.
- evolve-skills-from-feedback, feature-sliced-design, use-preferred-react-stack,
  and write-feature-tests shipped without a benchmark run; their suites are
  ready in `benchmarks/` if a regression shows up.
- One repetition cannot separate lean-v1 from the original within about five
  points; it only shows that no skill lost quality.
- The rubric is saturated for skill variants; further rounds need harder tasks
  or criteria for the owner's bar.
