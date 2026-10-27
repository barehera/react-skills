# October 27 2026 project memory decisions

## Source and evidence

- The repository owner asked for the companion packs to become light enough
  to install by default, starting with memory, because current models do not
  need heavy machinery and extra context hurts them. After a review they
  chose plain Markdown and asked for claude-mem to be removed.
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) v15.3.0,
  read on 2026-10-27 at commit `35f2ec0`:
  - about 600 TypeScript files (around 148K lines), 31 skills, and 26 MCP tool
    definitions;
  - hooks on 9 events, including `PostToolUse` on every tool, which sends tool
    input and output to a background worker where a second model writes an
    XML observation;
  - SQLite plus a Chroma vector store, on by default;
  - up to 10,000 characters (50 observations and 10 session summaries) added
    at every session start, whether or not the task needs them;
  - a `PreToolUse` hook on reads that adds file history and blocks full reads
    of files of 32 KB or more. Its own eval measured +20% cost on Opus for a
    19 KB file.
- Claude Code's built-in auto memory uses the same shape this skill adopts: a
  Markdown index loaded first and one frontmatter file per fact.

## Decisions

| Finding | Decision | Destination | Reason |
| --- | --- | --- | --- |
| Memory across sessions is worth having for every agent | accepted | New `keep-project-memory` skill | claude-mem works only in Claude Code; a Markdown folder works in every agent that reads `.agents/skills` |
| Background worker, observer model, database, vector store | rejected | n/a | The agent that did the work understands it best at that moment. A second model, a process, and two stores add cost and failure modes without better recall at project scale, where `grep` is enough |
| Context injected at every session start | rejected | n/a | The skill reads only the index, then opens the files a task needs |
| Hooks on every tool call and a read gate | rejected | n/a | Catalog skills are task-scoped and model-invoked, as the 2026-10-22 ledger decided. claude-mem's own eval shows the read gate costing more on Opus |
| Layered recall: index, then context, then details | adapted | `SKILL.md` Recall | The index and the per-fact files are the two layers |
| Record what was learned, not the process; skip noise and duplicates | adapted | `SKILL.md` Save and the ladder | Search before saving, update instead of duplicating, never save task progress |
| Keep verified facts apart from guesses; never save secrets | accepted | `SKILL.md` Save and the never-cut list | The folder may be committed and shared |
| Observation types bugfix, feature, refactor, change | rejected | n/a | Git history records them |
| Observation types decision, discovery, gotcha, pattern | adapted | `decision`, `gotcha`, `preference`, `context` | Four types cover what the code and git do not record |
| Loading the index each session without a hook | adapted | One line added to `AGENTS.md` the first time memory is saved | One instruction line costs less than a session-start hook and works in every agent. The installer does not edit project files |
| Overlap with an agent's own personal memory | accepted | Companion routing | Personal preferences stay in the agent's memory and project facts go here, never both |
| Remove the claude-mem companion | accepted | `bin/companions.mjs`, README, stack guide, installer test | The skill replaces it. A saved install state that names it is already filtered out on update |
| A stack-guide home for skills that own no layer | accepted | `docs/technology-stack.md` Skill boundaries | Names agent workflow skills: plain files, no hooks, processes, or databases |

## Known gaps and follow-ups

- No benchmark yet compares sessions with and without the skill. A
  skill-bench suite needs multi-session tasks, which the harness does not run
  today.
- Recall relies on the `AGENTS.md` line or the skill description triggering.
  An agent that reads neither starts without memory until the user asks.
- Superpowers and Caveman are the next candidates for light in-house
  versions.
