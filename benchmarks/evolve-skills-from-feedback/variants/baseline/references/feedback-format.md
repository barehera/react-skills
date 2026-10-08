# Feedback report format

Use this format when capturing feedback in a consuming project. Markdown is the
canonical interchange format; ingest mode may normalize JSON or plain text into
the same fields.

## Audience and portability contract

The report instructs an agent improving `target_skill`; it does not instruct
that agent to finish or revise the originating product feature. Project paths,
export names, and local snippets belong under `Evidence` as provenance.
`Preferred behavior`, `Proposed skill change`, reusable examples, and
`Acceptance criteria` must instead name or test a skill rule, reference,
example, validator, or another skill artifact.

Generalize examples before drafting those reusable sections. Use vocabulary the
target skill could publish, or a short neutral name. When origin and portable
examples must both appear, label them `origin (do not ingest)` and `skill
example (ingest this)`. A `project-convention` finding may recommend a local
repository change, but must be classified explicitly.

## File location

Prefer:

```text
.agents/feedback/<target-skill>/<YYYY-MM-DD>-<topic>.md
```

Use `docs/skill-feedback/` when the project intentionally tracks agent guidance
with product documentation or does not use `.agents`.

## Required metadata

Start with YAML frontmatter:

```yaml
---
feedback_version: 1
target_skill: build-composable-components
target_skill_version: 1.4.0
source_project: redacted-or-repository-name
captured_at: 2026-07-31
status: ready
---
```

- `feedback_version` is the report schema version and is currently `1`.
- `target_skill` is the canonical skill name.
- `target_skill_version` is the installed catalog version, commit, or
  `unversioned`.
- `source_project` may be anonymized, but must distinguish separate reports.
- `captured_at` uses `YYYY-MM-DD`.
- `status` is `draft`, `ready`, `applied`, or `rejected`.

## Required document sections

- `# Skill Feedback: <target skill>`
- `## Executive Summary`
- `## Project Context`
- `## Findings`
- `## Cross-Cutting Decisions`
- `## Validation Requested`

Each finding starts with `### F-001: <short outcome>` and contains:

- `Category`, `Severity`, `Recurrence`, and `Confidence` fields;
- `#### Scenario` with the task and repository constraints;
- `#### Evidence` with exact paths, narrow excerpts, tests, or user feedback;
- `#### Current behavior` describing what happened without speculation;
- `#### Preferred behavior` recording the accepted result and rationale;
- `#### Proposed skill change` naming the likely skill rule, reference,
  reusable example, or validator rather than an application file;
- `#### Generalization test` describing where the proposal should and should
  not apply;
- `#### Acceptance criteria` containing checks observable on the skill or its
  behavior on a fresh task.

Use the template in `assets/skill-feedback-template.md`. Keep findings useful
without the original chat history.

Before setting `status: ready`, apply the deletion gate: if the originating
feature were deleted, would every reusable finding still teach the right
behavior? Rewrite feature-bound proposals and checks until the answer is yes,
or classify them as `project-convention`. Keep origin evidence intact.

`Validation Requested` should name the skill files or validators to change and
include a fresh-task prompt that does not mention the originating feature. A
validator-only finding may use a portable fixture instead of a prose prompt.

Ready-to-ingest checklist:

- the Executive Summary says the target is the named skill, not the product;
- each reusable finding has a rule and boundary, portable example, skill
  destination, and skill-observable acceptance criteria;
- origin paths occur only as evidence, unless the finding is explicitly a
  `project-convention`;
- the forward-test exercises the improved skill on a new task.

## JSON and plain-text input

Do not reject an artifact merely because it is not Markdown. Map available
fields to the canonical model, mark missing evidence explicitly, and preserve
the original artifact. Ask a question only when a missing decision would
materially change the recommended skill behavior.
