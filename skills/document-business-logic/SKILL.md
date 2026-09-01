---
name: document-business-logic
description: Preserve non-obvious product decisions in code comments while defaulting to no comment. Use when writing, refactoring, or auditing React or TypeScript code, when asked to "document it", or when tempted to add, clean up, or review inline implementation comments; keep genuine rules in one Business Logic / Why / Rule block instead of narrating control flow, CSS, transports, or history.
---

# Document Business Logic

Comments preserve product decisions, not an explanation of how the code works.
Most edited code should receive no new comment.

## Required workflow

1. Read repository instructions and nearby comments before editing. If the
   project documents another comment standard, follow it while keeping this
   skill's no-narration and no-invented-rationale boundaries.
2. For each comment introduced or encountered in the code being changed,
   distinguish:
   - a non-obvious product rule a future maintainer could accidentally break;
   - required technical documentation such as a public API contract, license,
     generated-file warning, lint suppression, or structural section label;
   - implementation narration that restates code, control flow, styling,
     transport timing, or change history.
3. Keep required technical documentation. Remove implementation narration from
   the edited scope. Add a business-logic block only when reliable product
   evidence supports all three fields below.
4. Place one block immediately above the function, component, hook, store
   action, or const that owns the rule. Do not scatter inline comments through
   its body.
5. When the user says "document it", use the business purpose, product reason,
   and protected constraint they supplied. If any are missing, ask for those
   facts before writing the block; do not derive a product story from the call
   stack or implementation details.
6. When editing existing comments, clean only files and code already in scope.
   Replace a rambling comment with one supported block or remove it; do not keep
   both and do not launch a repository-wide comment cleanup.

## Business comment contract

Use this default format when the repository has no conflicting documented
standard:

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
- Write one English sentence per labeled line, even when the surrounding
  conversation uses another language.

Add the block only when the rule would otherwise look accidental, overly
restrictive, or safe to delete. Prefer expressive names, types, tests, and
smaller functions when they already communicate the constraint.

## Do not comment

Omit or remove comments that:

- restate an identifier, condition, or the next statement;
- narrate control flow, CSS classes, event-stream ordering, or framework
  mechanics;
- preserve implementation history, a workaround essay, or disabled code;
- use `Business Logic` headings to make an obvious derived value look special;
- invent a `Why` from technical symptoms when the product reason is unknown.

Do not replace license headers, generated-file banners, required suppressions,
public API documentation, accessibility notes, or structural section labels.
Those have different purposes and are not business-logic comments.

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

Right: when product evidence confirms the rule, document the behavior and
constraint at its owner.

```typescript
/**
 * Business Logic: Let users confirm a pending request only when it is ready.
 * Why: The product may show the decision before it is valid to submit.
 * Rule: Keep Confirm disabled until the request reaches the ready state.
 */
function ConfirmationAction(props: ConfirmationActionProps) {
  return <Button {...props} disabled={!props.isReady} />
}
```

The example's rationale is illustrative, not a template for invented `Why`
lines. Use only facts supported by the current task, product documentation,
tests, or direct user guidance.

## Completion check

- An ordinary focused edit adds zero comments or one supported business block.
- Every new business block has three single-sentence English lines at the
  owning declaration.
- The edited function body contains no new inline implementation narration.
- Existing essays in the touched scope were removed or replaced, not retained
  beside the new block.
- Product rationale was verified rather than inferred from code mechanics.
