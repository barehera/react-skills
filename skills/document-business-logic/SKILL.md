---
name: document-business-logic
description: Preserve non-obvious product decisions in code comments while defaulting to no comment. Use when writing, refactoring, or auditing React or TypeScript code, when asked to "document it", or when tempted to add, clean up, or review inline implementation comments; keep genuine rules in one Business Logic / Why / Rule block instead of narrating control flow, CSS, transports, or history.
---

# Document Business Logic

Comments preserve product decisions, not an explanation of how the code works.
Most edited code should receive no new comment.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

Product rules live only in the feature adapter, so a business block belongs on
a feature component, hook, store action, or const. A comment that seems to need
a product reason inside a primitive or a generic family is a sign the rule is
in the wrong layer; route the move to the owning skill instead of documenting
it in place.

## Required workflow

1. Read repository instructions and nearby comments before editing. If the
   project documents another comment standard, follow it; the no-narration,
   supported-rationale, owning-declaration, and scoped-cleanup boundaries of
   this skill still apply.
2. Classify each comment you would add or that you meet in the code being
   changed:
   - a non-obvious product rule a future maintainer could accidentally break:
     write or keep one [business block](#business-block);
   - required technical documentation (license, generated-file banner,
     required lint suppression, public API documentation, accessibility note,
     structural section label): keep it, because it has a different owner and
     purpose;
   - implementation narration (restating an identifier, condition, or the next
     statement; control flow, CSS classes, event-stream order, transport
     timing, or framework mechanics; change history, workaround essays, or
     disabled code): remove it.
3. When the user says "document it", use the business purpose, product reason,
   and protected constraint they supplied. If any is missing, ask for it before
   writing the block; do not derive a product story from the call stack or
   implementation details.
4. Clean only files and code already in scope. Replace a rambling comment with
   one supported block or remove it; do not keep both and do not launch a
   repository-wide comment cleanup.

## Business block

Use this format when the repository has no conflicting documented standard:

```typescript
/**
 * Business Logic: [user-visible behavior or policy]
 * Why: [why the product needs it, not how the code achieves it]
 * Rule: [invariant a later change must not break]
 */
```

- Default to no comment. Add the block only when a maintainer could break a
  user-visible policy because the code looks accidental, unnecessarily
  restrictive, or safe to delete. Prefer an expressive name, type, focused
  function, or behavioral test when it already communicates the rule, and
  never put the block on an obvious derived value.
- Each field needs reliable evidence from the task, product documentation,
  tests, or direct user guidance. Never invent a `Why` from CSS, event-stream
  order, framework mechanics, call stacks, or implementation history; ask
  instead.
- Write one English sentence per labeled line, even when the conversation uses
  another language.
- Place one block immediately above the function, component, hook, store
  action, or const that owns the rule, never as inline comments in its body.
  An ordinary focused edit adds zero comments or one supported block.

Wrong, because it narrates transport timing and the next condition:

```typescript
// The response can arrive while the previous stream is still open, so the
// action must wait or the request will no-op.
const isConfirmationDisabled = status !== "ready"
```

Right: [wait-lock.tsx](examples/wait-lock.tsx), one block on the component
that owns a verified policy, with its obvious derived values uncommented. Its
rationale is illustrative, not a template; use only facts supported in the
current task.

## Companion skill routing

This skill owns comment decisions, not the behavior being documented. Use the
installed owning skill for the code change:

- `$build-composable-components`: shadcn/Radix and compound UI behavior;
- `$build-forms`: React Hook Form, Zod form rules, and browser form UX;
- `$manage-server-state`: Axios contracts, TanStack Query, mutations, and
  cache lifecycle.

If a useful companion is missing, explain its concrete benefit once and ask
before installing it. If the user declines, continue without it; a companion
is never a hidden prerequisite.
