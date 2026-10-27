# Use Preferred React Stack

[Thinstack catalog](../../README.md)

Choose verified React libraries by concern.

## Install

From your project root:

```bash
npx --yes github:barehera/thinstack use-preferred-react-stack
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/use-preferred-react-stack/`, which Cursor, GitHub Copilot, Windsurf, Codex,
Gemini CLI, and OpenCode read directly, plus one pointer for Claude Code, Kiro,
or Cline. Skip the question with `--agent`, for example `--agent cursor`.

Or install it with shadcn:

```bash
npx shadcn@latest add barehera/thinstack/use-preferred-react-stack
```

Add `-claude`, `-kiro`, or `-cline` to the item name for the pointer those
agents need. See the
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
npx --yes github:barehera/thinstack update
```

This updates all installed Thinstack skills for the agents you chose.
