---
name: document-business-logic
description: Preserve non-obvious product decisions in code comments while defaulting to no comment. Use when writing, refactoring, or auditing React or TypeScript code, when asked to "document it", or when tempted to add, clean up, or review inline implementation comments; keep genuine rules in one Business Logic / Why / Rule block instead of narrating control flow, CSS, transports, or history.
---

# Document Business Logic

Comments preserve product decisions, not an explanation of how the code works.
Most edited code should receive no new comment.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

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
   evidence supports all three fields in
   [comment-contract.md](references/comment-contract.md).
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

## Core contracts

- Default to no comment. Prefer expressive names, types, tests, and smaller
  functions when they already communicate the constraint.
- Use exactly one `Business Logic` / `Why` / `Rule` block for a supported
  product rule when the repository has no conflicting documented standard.
- Write one English sentence per labeled line, even when the surrounding
  conversation uses another language.
- Put the block at the owning declaration, never inline inside its body.
- Do not replace licenses, generated-file banners, required suppressions,
  public API documentation, accessibility notes, or structural section labels.
- Do not invent a product reason from CSS, event-stream order, framework
  mechanics, call stacks, or implementation history.

## Companion skill routing

This skill owns comment decisions, not the behavior being documented. Use the
installed owning skill for the code change when relevant:

- `$build-composable-components` for shadcn/Radix and compound UI behavior;
- `$build-forms` for React Hook Form, Zod form rules, and browser form UX;
- `$manage-server-state` for Axios contracts, TanStack Query, mutations, and
  cache lifecycle.

If a useful companion is missing, explain its concrete benefit once and ask
before installing it. Continue without installation if the user declines; do
not make a companion a hidden prerequisite.

## Read focused guidance

- Read [comment-contract.md](references/comment-contract.md) before adding,
  rewriting, or auditing comments.
- Inspect [wait-lock.tsx](examples/wait-lock.tsx) when a user-visible policy
  needs one business block while its obvious derived values remain uncommented.

## Completion check

- An ordinary focused edit adds zero comments or one supported business block.
- Every new business block has three single-sentence English lines at the
  owning declaration.
- The edited function body contains no new inline implementation narration.
- Existing essays in the touched scope were removed or replaced, not retained
  beside the new block.
- Product rationale was verified rather than inferred from code mechanics.
