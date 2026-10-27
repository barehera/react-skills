---
name: keep-project-memory
description: Keep a small Markdown memory of a project in `.agents/memory/` so the next session starts from what earlier sessions learned. Use at the start of work in a repository that has `.agents/memory/MEMORY.md`; when the user says remember, note, forget, or "we already decided"; when the user corrects how the agent works in this project; or when a decision, gotcha, or constraint comes up that the code and git history do not record.
---

# Keep Project Memory

Remember what a project taught earlier sessions with plain Markdown files: an
index the agent reads first and one short file per fact.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns no application layer and never edits application code. A
memory may name the layer a decision governs, so the next session places code
without re-deriving the split.

## Memory layout

```text
.agents/memory/
  MEMORY.md         the index: one line per memory, read first
  <slug>.md         one fact per file
```

Each memory file:

```markdown
---
name: <slug, same as the file name>
description: <one line that tells a later session whether to open this file>
type: decision | gotcha | preference | context
updated: <YYYY-MM-DD>
---

<The fact in one to five sentences.>

Why: <the reason or the incident behind it>
How to apply: <what to do differently next time>
```

Each index line: `- [Title](<slug>.md) — <hook of a few words>`.

| Type | Holds |
| --- | --- |
| `decision` | A choice the team made and why, when the code alone does not show the reason |
| `gotcha` | A trap that cost time: a tool quirk, a failing setup step, a misleading API |
| `preference` | How the user wants work done here, from a correction or a confirmed approach |
| `context` | A constraint, deadline, owner, or external pointer that is not in the repository |

There is no database, hook, background worker, or vector search. The index and
`grep` find a memory, and the agent writing it is the one that understood it.

## Required workflow

### Recall

1. At the start of a task, read `.agents/memory/MEMORY.md` if it exists. Read
   nothing else yet; the index is the cheap layer.
2. Open only the memory files whose description bears on the task. Use
   `grep -ril <term> .agents/memory` when the index wording does not match.
3. Treat a memory as a record of what was true when it was written. Before
   acting on one that names a file, function, flag, or command, check that it
   still exists. Update or delete a memory that turns out to be wrong.

### Save

1. Save at the moment you learn something worth keeping, while the reason is
   still in front of you, not in a summary at the end.
2. Save from these sources: a user correction, a decision and its reason, a
   gotcha that cost time, a confirmed preference, a constraint the user states.
3. Search the index first. Update the memory that already covers the fact
   instead of adding a second one.
4. Write one fact per file, with the `Why:` and `How to apply:` lines for
   `decision`, `gotcha`, and `preference`. Turn relative dates into absolute
   ones, and mark an unverified belief as `Unverified:`.
5. Add or update the index line in the same change.
6. The first time you create `.agents/memory/`, add one line to the
   repository's agent instructions file (`AGENTS.md`, or `CLAUDE.md` when that
   is the only one): `Read .agents/memory/MEMORY.md before starting work.`
   Tell the user you added it.

### Forget and tidy

- When the user says forget, delete the file and its index line.
- Merge memories that say the same thing and delete stale ones. Keep the
  index under about 150 lines, because every session reads it.

## Smallest complete change

Write only what a later session needs. Take the first option that fully
works:

1. Save nothing when the code, git history, a code comment, or the project
   docs already record it, or when it matters only to this conversation.
2. Update the memory that already covers the fact.
3. Add a line to an existing memory on the same topic.
4. Write one new memory file and one index line.

- Never save secrets, credentials, tokens, personal data, or anything the user
  asked you not to keep, because the folder may be committed and shared.
- Never save task progress, step lists, or transcript excerpts; they go stale
  within a session.
- End the handoff with one `Skipped:` line for what was left out on purpose
  and one `Not checked:` line for what could not be verified.

## Companion skill routing

- A non-obvious product rule belongs next to its code as a business-logic
  block, owned by `$document-business-logic`, not in memory. A memory may
  point to it.
- A lesson about a React Skills skill itself (a missing rule, a bad example)
  goes in a feedback report through `$evolve-skills-from-feedback`.
- Placement and import decisions belong to `$feature-sliced-design`; record
  only the project-specific exception and its reason.
- When the agent has its own personal memory (for example Claude Code auto
  memory), keep personal working preferences there and project facts here.
  Never write the same fact to both.
- If a useful companion is not installed, explain its concrete benefit once
  and ask before installing it. Continue without it if the user declines.

## Defaults

- Location: `.agents/memory/` at the repository root.
- Git: the skill never commits, ignores, or un-ignores the folder. Commit it to
  share memory with the team, or add it to `.gitignore` to keep it local; the
  user decides.
- Slugs: short lowercase kebab-case nouns, such as `pnpm-only` or
  `release-freeze-2026-11`.
