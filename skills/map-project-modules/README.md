# Map Project Modules

Give the agent a one-page map of your codebase so it searches narrowly instead
of reading broadly.

The map lives in `.agents/map/MODULE_MAP.md`: entry points, one row per module
with its layer and purpose, the files most other files import, and the commit
it was built at. The agent reads the map, searches inside the modules a task
touches, and opens only the lines it finds. When the commit is old, it
refreshes only the rows of modules that changed.

There is no Python, parser, graph database, or hook on reads and searches. The
map is plain Markdown the agent writes with `git ls-files` and `grep`.

## Install

From your project root:

```bash
npx --yes github:barehera/thinstack map-project-modules
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/map-project-modules/`, which Cursor, GitHub Copilot,
Windsurf, Codex, Gemini CLI, and OpenCode read directly, plus one pointer for
Claude Code, Kiro, or Cline. Skip the question with `--agent`, for example
`--agent cursor`.

Or install it with shadcn:

```bash
npx shadcn@latest add barehera/thinstack/map-project-modules
```

Add `-claude`, `-kiro`, or `-cline` to the item name for the pointer those
agents need. See the [install guide](../../README.md#install) for every option.

The first time the agent writes the map, it adds one line to your `AGENTS.md`
(or `CLAUDE.md`) so later sessions read it before searching.

## Use it

```text
Use $map-project-modules to map this codebase.
```

```text
Where is the refund rule enforced? Use the module map.
```

```text
The module map is from last month. Refresh what changed.
```

## Update

```bash
npx --yes github:barehera/thinstack update
```

This updates all installed Thinstack skills for the agents you chose. Your map is
yours and is never touched by an update.
