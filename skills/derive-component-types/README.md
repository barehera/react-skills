# Derive Component Types

[React Skills catalog](../../README.md)

Give every type one owner so a changed field reaches every component through
the compiler, not a cast.

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills derive-component-types
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/derive-component-types/`, plus one pointer each for Claude Code, Cursor,
GitHub Copilot, or Windsurf. Codex reads `.agents/skills` directly. Skip the
question with `--agent`, for example `--agent cursor`.

Or install it with shadcn, choosing the item for your agent:

```bash
npx shadcn@latest add barehera/react-skills/derive-component-types-cursor
```

Use `-claude`, `-copilot`, or `-windsurf` instead of `-cursor`; for Codex
alone, add `barehera/react-skills/derive-component-types`. See the
[install guide](../../README.md#install) for every option.

## Use

```text
Use $derive-component-types to type this order card from the Order response type instead of its own string props, and keep the shared date component reusable.
```

```text
Use $derive-component-types to fix the components that broke after the invoice status union changed, without adding casts.
```

```text
Use $derive-component-types to audit this feature for redeclared types. Report derived, owned, and manual decisions before editing.
```

## Guidance

- [Canonical instructions](SKILL.md)
- [drift audit](references/drift-audit.md)

Complete examples live in [examples](examples). Installation adds guidance, not runtime dependencies.

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose.
