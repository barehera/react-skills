---
feedback_version: 1
target_skill: build-composable-components
target_skill_version: 2.0.1
source_project: harbor-crm
captured_at: 2026-10-02
status: ready
---

# Skill Feedback: build-composable-components

## Executive Summary

Agents copied the action menu example's family-wide `loading` flag, so one
slow action disabled every other action in the menu. This report asks for
changes to the skill, not to the originating CRM screens.

## Project Context

- Task: Add row action menus (Duplicate, Archive, Export) to two list screens.
- Stack and conventions: React 19, shadcn/Radix, TanStack Query v5.
- Skill invocation: `$build-composable-components` to build the menu family.
- Evidence reviewed: two agent diffs, the accepted implementation, and review
  comments.

## Findings

### F-001: The example teaches one loading flag for every action

- Category: bad-example
- Severity: high
- Recurrence: repeated
- Confidence: high

#### Scenario

Each menu runs several independent mutations. While Export (slow, about ten
seconds) was pending, Duplicate and Archive were disabled too.

#### Evidence

origin (do not ingest), `src/features/contacts/contact-row-menu.tsx` first
version:

```tsx
<ActionMenu loading={duplicate.isPending || archive.isPending || exportCsv.isPending}>
```

Both agents reproduced `loading` from `examples/action-menu.tsx` name for name.
The accepted version removed the root flag and passed
`disabled={exportCsv.isPending}` to the Export item only. User comment: "Export
being slow should not lock the other actions."

#### Current behavior

The skill example puts a `loading` prop on the root, shares it through
context, and every item ORs it into `disabled`.

#### Preferred behavior

Pending and disabled state belong to the action that runs: the feature adapter
passes each item its own mutation's pending state. The family has no
family-wide loading flag.

#### Proposed skill change

Fix the canonical example so each item receives its own pending state from the
adapter, and add one composable-family rule stating that pending state belongs
to the action that runs it.

#### Generalization test

Applies to any family whose parts trigger independent async actions (menus,
toolbars, bulk action bars). Does not forbid a root-level `disabled` that the
consumer sets on purpose, for example while the whole record is read-only.

#### Acceptance criteria

- The skill example has no root-level loading flag; each item's `disabled`
  comes from its own action's pending state.
- A fresh task with two actions of different speed produces per-action pending
  state.

### F-002: Consumer className must be merged last

- Category: missing-rule
- Severity: medium
- Recurrence: once
- Confidence: medium

#### Scenario

One agent placed `className` before the base classes in a custom item part.

#### Evidence

origin (do not ingest), `src/features/deals/deal-menu-item.tsx`:
`cn(className, "px-2 py-1.5")`. Fixed in review.

#### Current behavior

The consumer could not override padding.

#### Preferred behavior

Merge the consumer `className` last with `cn` in every part.

#### Proposed skill change

Add a rule to `SKILL.md` that parts merge the consumer `className` last.

#### Generalization test

Applies to every part that renders a primitive.

#### Acceptance criteria

- `SKILL.md` states that consumer `className` is merged last.

### F-003: Add a validator for loading props

- Category: validation-gap
- Severity: low
- Recurrence: repeated
- Confidence: medium

#### Scenario

Reviewers caught the shared flag manually twice.

#### Evidence

Two review comments on the origin pull requests flagging `loading=` on the
menu root.

#### Current behavior

Nothing catches the pattern before review.

#### Preferred behavior

The skill catalog fails fast when an example reintroduces the pattern.

#### Proposed skill change

Add a validation script that fails when any example or component declares a
prop named `loading`.

#### Generalization test

Should catch shared loading flags in examples. A prop named `loading` on a
single-action part, such as a submit button, is legitimate.

#### Acceptance criteria

- The catalog validation fails on an example that declares a `loading` prop.

## Cross-Cutting Decisions

Action state is owned by the action, not by the family.

## Validation Requested

- Run `npm run typecheck` from the app root after editing the example.
- Fresh-task prompt: "Add a ⋯ menu to each row of an orders table with Refund
  (slow) and Copy link (instant); make the menu reusable."
