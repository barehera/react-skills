# Derived Types

[Thinstack catalog](../../README.md)

Give every type one owner so a changed field reaches every component, hook,
and helper through the compiler, not a cast.

## Install

From your project root:

```bash
npx --yes github:barehera/thinstack derived-types
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/derived-types/`, which Cursor, GitHub Copilot, Windsurf, Codex,
Gemini CLI, and OpenCode read directly, plus one pointer for Claude Code, Kiro,
or Cline. Skip the question with `--agent`, for example `--agent cursor`.

Or install it with shadcn:

```bash
npx shadcn@latest add barehera/thinstack/derived-types
```

Add `-claude`, `-kiro`, or `-cline` to the item name for the pointer those
agents need. See the
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
npx --yes github:barehera/thinstack update
```

This updates all installed Thinstack skills for the agents you chose.
