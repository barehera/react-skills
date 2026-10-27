# Keep Project Memory

Give every session in a project the decisions, gotchas, and preferences that
earlier sessions learned, with nothing but Markdown files.

The memory lives in `.agents/memory/`: a `MEMORY.md` index the agent reads at
the start of a task, and one short file per fact that it opens only when the
fact bears on the task. There is no database, hook, background worker, or
second model recording tool calls, so a session pays for the index and for the
memories it reads, nothing more. Every agent that can read files can use it.

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills keep-project-memory
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/keep-project-memory/`, which Cursor, GitHub Copilot,
Windsurf, Codex, Gemini CLI, and OpenCode read directly, plus one pointer for
Claude Code, Kiro, or Cline. Skip the question with `--agent`, for example
`--agent cursor`.

Or install it with shadcn:

```bash
npx shadcn@latest add barehera/react-skills/keep-project-memory
```

Add `-claude`, `-kiro`, or `-cline` to the item name for the pointer those
agents need. See the [install guide](../../README.md#install) for every option.

The first time the agent saves a memory, it adds one line to your `AGENTS.md`
(or `CLAUDE.md`) so later sessions read the index before starting. Commit
`.agents/memory/` to share it with your team, or ignore it to keep it local.

## Use it

```text
Remember that this repo uses pnpm only; npm install breaks the lockfile.
```

```text
Use $keep-project-memory: we decided to keep invoice totals in cents
because rounding broke the tax report. Save the decision.
```

```text
What do we already know about the payments webhook? Check project memory first.
```

```text
Forget the release freeze memory; the freeze is over.
```

## What it saves

| Type | Example |
| --- | --- |
| `decision` | Totals are stored in cents, because float rounding broke the tax report |
| `gotcha` | `vitest --watch` hangs on Windows unless `pool: "forks"` is set |
| `preference` | Short, prioritized review comments; no summary of the diff |
| `context` | Release freeze from 2026-11-20 to 2026-11-27 |

It does not save what the code or git history already shows, task progress,
or secrets.

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose. Your memory
files are yours and are never touched by an update.
