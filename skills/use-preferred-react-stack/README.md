# Use Preferred React Stack

[React Skills catalog](../../README.md)

Choose verified React libraries by concern.

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills use-preferred-react-stack
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/use-preferred-react-stack/`, plus one pointer each for Claude Code, Cursor,
GitHub Copilot, or Windsurf. Codex reads `.agents/skills` directly. Skip the
question with `--agent`, for example `--agent cursor`.

Or install it with shadcn, choosing the item for your agent:

```bash
npx shadcn@latest add barehera/react-skills/use-preferred-react-stack-cursor
```

Use `-claude`, `-copilot`, or `-windsurf` instead of `-cursor`; for Codex
alone, add `barehera/react-skills/use-preferred-react-stack`. See the
[install guide](../../README.md#install) for every option.

## Use

```text
Use $use-preferred-react-stack to choose libraries for shareable search, persisted preferences, and failure notices after checking the installed stack.
```

```text
Use $use-preferred-react-stack to audit this feature. Report decisions and boundaries before editing.
```

## Guidance

- [Canonical instructions](SKILL.md)
- [decision table](references/decision-table.md)
- [tanstack pacer](references/tanstack-pacer.md)
- [zustand](references/zustand.md)

Complete examples live in [examples](examples). Installation adds guidance, not runtime dependencies.

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose.
