# Extract Named Helpers

[React Skills catalog](../../README.md)

Extract focused helpers without needless indirection.

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills extract-named-helpers
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/extract-named-helpers/`, plus one pointer each for Claude Code, Cursor,
GitHub Copilot, or Windsurf. Codex reads `.agents/skills` directly. Skip the
question with `--agent`, for example `--agent cursor`.

Or install it with shadcn, choosing the item for your agent:

```bash
npx shadcn@latest add barehera/react-skills/extract-named-helpers-cursor
```

Use `-claude`, `-copilot`, or `-windsurf` instead of `-cursor`; for Codex
alone, add `barehera/react-skills/extract-named-helpers`. See the
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
- [extraction triggers](references/extraction-triggers.md)
- [hooks and helpers](references/hooks-and-helpers.md)
- [placement](references/placement.md)
- [signatures and naming](references/signatures-and-naming.md)

Complete examples live in [examples](examples). Installation adds guidance, not runtime dependencies.

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose.
