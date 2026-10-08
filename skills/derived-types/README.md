# Derived Types

[React Skills catalog](../../README.md)

Give every type one owner so a changed field reaches every component, hook,
and helper through the compiler, not a cast.

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills derived-types
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/derived-types/`, plus one pointer each for Claude Code, Cursor,
GitHub Copilot, or Windsurf. Codex reads `.agents/skills` directly. Skip the
question with `--agent`, for example `--agent cursor`.

Or install it with shadcn, choosing the item for your agent:

```bash
npx shadcn@latest add barehera/react-skills/derived-types-cursor
```

Use `-claude`, `-copilot`, or `-windsurf` instead of `-cursor`; for Codex
alone, add `barehera/react-skills/derived-types`. See the
[install guide](../../README.md#install) for every option.

## Use

```text
Use $derived-types to type this order card from the Order response type instead of its own string props, and keep the shared date component reusable.
```

```text
Use $derived-types to fix the components, hooks, and helpers that broke after the invoice status union changed, without adding casts.
```

```text
Use $derived-types to audit this feature for redeclared types. Report derived, owned, and manual decisions before editing.
```

## Guidance

- [Canonical instructions](SKILL.md)
- [Drift audit](references/drift-audit.md)

Complete examples live in [examples](examples). Installation adds guidance, not runtime dependencies.

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose.
