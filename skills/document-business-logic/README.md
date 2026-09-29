# Document Business Logic

[← React Skills catalog](../../README.md)

Preserve non-obvious product rules without filling React and TypeScript code
with implementation narration.

The default is no comment. When a future maintainer could otherwise break a
user-visible policy, the skill records one English block at the owning
declaration:

```typescript
/**
 * Business Logic: [user-facing purpose]
 * Why: [product reason]
 * Rule: [constraint a later change must preserve]
 */
```

The workflow also cleans rambling comments in files already being edited while
preserving licenses, generated-file warnings, public API documentation,
suppressions, accessibility notes, and structural section labels. It does not
invent a product `Why` from implementation details.

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills document-business-logic
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/document-business-logic/`, plus one pointer each for Claude Code, Cursor,
GitHub Copilot, or Windsurf. Codex reads `.agents/skills` directly. Skip the
question with `--agent`, for example `--agent cursor`.

Or install it with shadcn, choosing the item for your agent:

```bash
npx shadcn@latest add barehera/react-skills/document-business-logic-cursor
```

Use `-claude`, `-copilot`, or `-windsurf` instead of `-cursor`; for Codex
alone, add `barehera/react-skills/document-business-logic`. See the
[install guide](../../README.md#install) for every option.

## Use

The skill can apply during ordinary code creation, refactoring, or review when
comments are being considered. It can also be invoked explicitly:

```text
Use $document-business-logic to review comments in this component. Remove
implementation narration and preserve only supported product rules.
```

```text
Use $document-business-logic to document this function. If the business
purpose, product reason, or protected rule is missing, ask before writing it.
```

## Guidance

- [Canonical skill instructions](SKILL.md)
- [Business comment contract](references/comment-contract.md)
- [Typed wait-lock example](examples/wait-lock.tsx)

The shared `.agents/skills/VERSION` file records the React Skills release that
supplied the installed workflow.

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose.
