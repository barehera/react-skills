# Feedback report format

Markdown with YAML frontmatter is the canonical format, because it is readable
by people and agents, diffable, and preserves code evidence without a schema
tool. Copy [the template](../assets/skill-feedback-template.md): every heading,
field, and finding subsection in it is required, and
`scripts/validate-feedback.mjs` checks them.

## Metadata

- `feedback_version` is the report schema version, currently `1`.
- `target_skill` is the canonical skill name; `target_skill_version` is the
  installed catalog version, commit, or `unversioned`.
- `source_project` may be anonymized, but must distinguish separate reports.
- `captured_at` uses `YYYY-MM-DD`.
- `status` is `draft`, `ready`, `applied`, or `rejected`. Set `ready` only after
  every reusable finding passes the deletion gate.

## JSON and plain-text input

Do not reject an artifact merely because it is not Markdown. Map available
fields to the template's sections, mark missing evidence explicitly, and
preserve the original artifact. Ask a question only when a missing decision
would materially change the recommended skill behavior.
