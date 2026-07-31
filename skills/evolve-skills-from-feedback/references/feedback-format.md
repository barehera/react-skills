# Feedback report format

Use this format when capturing feedback in a consuming project. Markdown is the
canonical interchange format; ingest mode may normalize JSON or plain text into
the same fields.

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
- `#### Proposed skill change` naming the likely rule, reference, example, or
  validation change;
- `#### Generalization test` describing where the proposal should and should
  not apply;
- `#### Acceptance criteria` containing observable checks.

Use the template in `assets/skill-feedback-template.md`. Keep findings useful
without the original chat history.

## JSON and plain-text input

Do not reject an artifact merely because it is not Markdown. Map available
fields to the canonical model, mark missing evidence explicitly, and preserve
the original artifact. Ask a question only when a missing decision would
materially change the recommended skill behavior.
