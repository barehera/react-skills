# Business comment contract

Use this reference when deciding whether a comment belongs, writing the default
format, or cleaning comments in code already being edited.

## Contents

- [Default format](#default-format)
- [Comment threshold](#comment-threshold)
- [What to remove](#what-to-remove)
- [What to preserve](#what-to-preserve)
- [Examples](#examples)
- [Editing existing comments](#editing-existing-comments)

## Default format

Use this format when the repository has no conflicting documented standard:

```typescript
/**
 * Business Logic: [user-facing purpose]
 * Why: [product reason]
 * Rule: [constraint a later change must preserve]
 */
```

- `Business Logic` states the user-visible behavior or policy.
- `Why` states why the product needs that behavior, not how the implementation
  achieves it.
- `Rule` states the invariant a later refactor must not break.

Write one English sentence per labeled line. Place the block immediately above
the function, component, hook, store action, or const that owns the rule. Do not
scatter inline comments through its body.

## Comment threshold

Default to no comment. Add the block only when a future maintainer could break
a user-visible policy because the code looks accidental, unnecessarily
restrictive, or safe to delete. Require reliable evidence for purpose, reason,
and constraint from the task, product documentation, tests, or direct user
guidance.

Prefer an expressive name, type, focused function, or behavioral test when it
already communicates the rule. Do not use the block to make obvious code look
important.

## What to remove

Omit or remove comments that:

- restate an identifier, condition, or the next statement;
- narrate control flow, CSS classes, event-stream ordering, or framework
  mechanics;
- preserve implementation history, a workaround essay, or disabled code;
- use the three headings around an obvious derived value;
- invent a `Why` from technical symptoms when the product reason is unknown.

## What to preserve

Do not replace license headers, generated-file banners, required suppressions,
public API documentation, accessibility notes, or structural section labels.
Those comments have different owners and purposes.

When a repository defines another business-comment standard, follow it. The
no-narration, supported-rationale, owning-declaration, and scoped-cleanup
boundaries still apply.

## Examples

Obvious code needs no comment:

```typescript
const isDisabled = isLocked || !isReady
```

Wrong: this narrates transport timing and the next condition.

```typescript
// The response can arrive while the previous stream is still open, so the
// action must wait or the request will no-op.
const isConfirmationDisabled = status !== "ready"
```

Right: document a verified product rule at its owner, while leaving obvious
derived values uncommented. See the complete typed React example in
[wait-lock.tsx](../examples/wait-lock.tsx).

The example's rationale is illustrative, not a template for invented `Why`
lines. Use only facts supported in the current task.

## Editing existing comments

Clean only files and code already in scope. Remove narration the skill would
not have written. Replace a real, supported product rule with one block; do not
keep the essay beside it. If the purpose, reason, or constraint is unknown, ask
instead of fabricating a story from the implementation.
