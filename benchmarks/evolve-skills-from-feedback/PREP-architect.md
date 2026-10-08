# evolve-skills-from-feedback: benchmark prep (architect)

Suite: `benchmarks/evolve-skills-from-feedback/suite.json`. It uses the shared
`fixture`, `transferTasks: ["t4-skill-routing"]`, and rubricVersion 1. Nothing
under `variants/` or `results/` was read.

## Design

This skill produces reports and decisions, not UI code. The tasks therefore
check what only this skill teaches:

- the canonical report: its location, frontmatter, sections, and finding fields;
- classification of each finding, plus a decision for each one;
- portable proposals that pass the deletion gate;
- redaction;
- routing each lesson to the skill that owns it;
- layer checks;
- the mode boundary (capture, review, or apply).

To let tasks reach a target skill, the overlays add a small, purpose-built
`build-composable-components` (React Skills 2.0.1, about 60 lines, with the
required sections). It is copied in two ways:

- **Installed copy** in `.agents/skills/` (t1 and t4). Claude Code does not
  auto-load skills from there, so the target skill does not leak into the
  subject.
- **Editable source repo** in `tooling/react-skills/` (t2 and t3). This copy
  has `AGENTS.md`, `docs/adding-a-skill.md`, `docs/technology-stack.md`, a
  CHANGELOG, `registry.json`, a README, and a typed example. A t2/t3
  `tsconfig.json` overlay includes `tooling/react-skills/skills/*/examples/**/*.tsx`,
  so `npm run typecheck` also type-checks the skill example.

## Tasks

### t1-capture-feedback (create, capture mode)

The overlay holds:

- the accepted row-actions code: `src/components/ui/action-menu.tsx`,
  `features/tasks/components/task-actions.tsx`, and the wired TaskList and
  TaskDetailHeader;
- session notes in `docs/agent-sessions/2026-10-06-row-actions.md`, which
  include a seeded token, a customer email, a ticket number, and an API host;
- the installed target skill.

Three lessons are seeded in the notes:

- **Overlay inside transient menu content.** This is a missing rule, and the
  notes include a rejected intermediate fix (preventDefault plus
  `modal={false}`).
- **Size patched onto items.** The skill already has this rule, and it is
  ambiguous when the root renders no DOM element.
- **Ellipsis label copy.** This is a project convention.

| Criterion | Weight |
| --- | --- |
| report-location | 2 |
| report-format | 3 |
| one-claim-per-finding | 2 |
| accepted-implementation | 2 |
| existing-rule | 2 |
| project-convention | 2 |
| portable-proposals | 3 |
| redaction | 2 |
| capture-scope | 2 |
| layer-and-handoff | 1 |

### t2-ingest-review (audit, review mode, seeded answer key)

The input is a JSON feedback file at
`tooling/react-skills/feedback/incoming/north-team-action-menu.json`, written
against v1.9.0 while the current source is 2.0.1. The prompt asks for a review
with no edits. The answer key:

| Item | Expected decision | Why |
| --- | --- | --- |
| N1 | adapted or accepted | Narrow "never any dialog" to the rule that an overlay must not live inside transient content |
| N2 | already-covered | Covered by rule 3; the CHANGELOG shows it was added in 2.0.0 |
| N3 | rejected | Boundary violation: the family would call useViewer or the policy check |
| N4 | needs-evidence | The evidence field is empty |
| N5 | project-only | Local convention |
| N6 | adapted | Scope it to React Compiler projects instead of "never useMemo" |

| Criterion | Weight |
| --- | --- |
| no-edits | 2 |
| decision-ledger | 3 |
| already-covered-version | 2 |
| boundary-violation | 3 |
| needs-evidence | 2 |
| project-only | 2 |
| scoped-rules | 2 |
| accepted-placement | 2 |
| input-handling | 1 |
| report-quality | 1 |

### t3-ingest-apply (extend, apply mode)

The input is a canonical Markdown report. It already passes
`validate-feedback.mjs` with 3 findings. The answer key:

- **F-001 (bad-example):** the example's family-wide `loading` flag. Fix the
  example so each action owns its pending state, and add one rule.
- **F-002:** "className merged last" is already covered by rule 2.
- **F-003:** a validator that matches on the prop name `loading`. The right
  decision is reject or adapt, because the report itself says a single-action
  `loading` prop is legitimate.

| Criterion | Weight |
| --- | --- |
| example-fixed | 3 |
| rule-once | 2 |
| already-covered | 2 |
| validator-judgment | 2 |
| contract-kept | 2 |
| decision-ledger | 2 |
| evidence-preserved | 1 |
| scope | 1 |

### t4-skill-routing (create, transfer)

Capture mode with two target skills. The overlay adds:

- an installed mini `manage-server-state` skill, whose example deliberately
  does not return the invalidation promise;
- merged code: `components/ui/selection-bar.tsx`, a bulk-archive adapter, and
  `use-archive-tasks-mutation.ts`;
- a plain-text PR review thread in `docs/reviews/pr-212.md`.

It is unlike the skill's examples: it covers server state, needs one report
per target skill, and includes the false-positive and tool-limitation
categories. Seeded lessons:

- cache sequencing goes to manage-server-state; the skill's own example is the
  cause;
- the `actions` config array goes to build-composable-components;
- the "should be optimistic" comment is a false positive;
- the sandbox Vitest failure (spawn EPERM) is a tool limitation.

| Criterion | Weight |
| --- | --- |
| per-skill-reports | 3 |
| routing | 3 |
| root-cause | 2 |
| false-positive | 2 |
| tool-limitation | 2 |
| report-format | 2 |
| portable-proposals | 2 |
| evidence-and-final | 1 |
| layer | 1 |
| capture-scope | 1 |

## Packages needed

None. Every overlay uses only what the shared fixture already has.

## Verification

For each task, I copied the fixture (without `node_modules`) plus its overlay
to the scratchpad `prep/evolve-skills-from-feedback/<task>`, junctioned
`node_modules`, and ran `npm run typecheck`.

| Task | `task.json` | Typecheck |
| --- | --- | --- |
| t1 | valid JSON | exit 0 |
| t2 | valid JSON | exit 0 |
| t3 | valid JSON | exit 0 |
| t4 | valid JSON | exit 0 |

Two extra checks:

- In t3, `tsc --listFilesOnly` lists the skill example. An injected type error
  in the example failed the typecheck, so example edits are really checked.
- The t3 input report passes `validate-feedback.mjs` ("Validated 3 findings").

I removed the junctions with `rmdir` before deleting the scratch folder. The
fixture's `node_modules` is intact.

## Open questions

1. **Grader persona.** The harness grader prompt says "strict senior React
   reviewer" and talks about code. These tasks grade reports and ledgers.
   Consider a per-suite grader preamble so the grader reads the
   `.agents/feedback/**` files, not just REPORT.md.
2. **Validator access in headless runs.** Headless `run` limits Bash to
   `npm run typecheck`, so subjects cannot run `validate-feedback.mjs` there.
   Subagent subjects have full Bash. The report-format criteria are written so
   a grader can check them by reading. Optionally, add a post-run clerk check
   that runs the validator on every `.agents/feedback/**/*.md`, as an objective
   signal.
3. **Version.** `prepareWorkspace` writes `.claude/skills/VERSION = 2.0.1`, and
   the mini target skills also say 2.0.1. Both match the rubric's
   `React Skills v2.0.1` and `target_skill_version: 2.0.1`.
4. **Fixed date.** The `captured_at` date and the report file name depend on
   the run date. The criteria accept any YYYY-MM-DD.
5. **Possible weak control signal.** A `none` control may still do well on
   judgment criteria such as N3 and N6. The skill's distinctive value should
   show on report-format, location, portability, routing, and the decision
   vocabulary.
6. **Reuse.** The mini skill repo in t2/t3 is duplicated across the two
   overlays (the harness has no shared-overlay mechanism). Keep the two copies
   identical if either changes.
