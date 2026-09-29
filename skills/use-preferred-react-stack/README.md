# Use Preferred React Stack

[React Skills catalog](../../README.md)

Choose verified React libraries by concern.

## Install

From your project root:

```bash
react-skills use-preferred-react-stack
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/use-preferred-react-stack/`, plus one pointer each for Claude Code, Cursor,
GitHub Copilot, or Windsurf. Codex reads `.agents/skills` directly. Skip the
question with `--agent`, for example `--agent cursor`.

With Claude Code, `--global` installs it once for every project instead. See
the [install guide](../../README.md#install) for the one-time setup and every
option.

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
react-skills update
```

This updates all installed React Skills for the agents you chose.
