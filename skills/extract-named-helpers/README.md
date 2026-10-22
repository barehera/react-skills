# Extract Named Helpers

[React Skills catalog](../../README.md)

Extract focused helpers without needless indirection.

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills extract-named-helpers
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/extract-named-helpers/`, which Cursor, GitHub Copilot, Windsurf, Codex,
Gemini CLI, and OpenCode read directly, plus one pointer for Claude Code, Kiro,
or Cline. Skip the question with `--agent`, for example `--agent cursor`.

Or install it with shadcn:

```bash
npx shadcn@latest add barehera/react-skills/extract-named-helpers
```

Add `-claude`, `-kiro`, or `-cline` to the item name for the pointer those
agents need. See the
[install guide](../../README.md#install) for every option.

## Use

```text
Use $extract-named-helpers to simplify this React hook and its domain utilities while preserving behavior and leaving obvious expressions inline.
```

```text
Use $extract-named-helpers to audit this feature. Report decisions and boundaries before editing.
```

## Guidance

- [Canonical instructions](SKILL.md)
- [placement](references/placement.md)

Complete examples live in [examples](examples). Installation adds guidance, not runtime dependencies.

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose.
