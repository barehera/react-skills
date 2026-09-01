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

Choose it from the interactive catalog:

```bash
npx --yes github:barehera/react-skills
```

Or install it directly:

```bash
npx shadcn@latest add barehera/react-skills/document-business-logic
```

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

The shared `.agents/skills/VERSION` file records the React Skills release that
supplied the installed workflow.

## Update

```bash
npx shadcn@latest add barehera/react-skills/document-business-logic --overwrite
```
