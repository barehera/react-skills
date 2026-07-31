---
feedback_version: 1
target_skill: build-composable-components
target_skill_version: 1.4.0
source_project: architecture-lab
captured_at: 2026-07-31
status: ready
---

# Skill Feedback: build-composable-components

## Executive Summary

The component behavior and variant styling were correct, but a long Tailwind
class string mixed base layout with two semantic variant branches. Group the
classes by concern without changing merge precedence or generated output.

## Project Context

- Task: Extend a shadcn Card with family-level color variants.
- Stack and conventions: React 19, Tailwind CSS 4, shadcn-style `cn` merging.
- Skill invocation: Build and audit a composable component family.
- Evidence reviewed: Accepted `CardFooter` implementation and user correction.

## Findings

### F-001: Group long Tailwind lists by styling concern

- Category: missing-rule
- Severity: medium
- Recurrence: repeated
- Confidence: high

#### Scenario

The footer inherited `primary` and `destructive` styling from a named Card
group while retaining its base layout and consumer `className` override.

#### Evidence

The accepted implementation used separate `cn(...)` arguments for base,
primary, destructive, and consumer classes. Lint and typecheck passed with no
rendering change.

#### Current behavior

The prior example placed base layout and both semantic variants into one long
string, obscuring the style model during review.

#### Preferred behavior

Keep short lists intact. Split a long list into ordered strings when it mixes
layout, interaction states, themes, or named variants. Keep `className` last.

#### Proposed skill change

Add a concise core rule, detailed styling guidance, a worked example, and an
audit-checklist item. Do not require one string per utility.

#### Generalization test

Apply the rule when multiple concerns are difficult to scan. Do not split a
short two-utility list or move one-use groups to distant constants.

#### Acceptance criteria

- Base, state, and variant groups are recognizable at the call site.
- Tailwind conflict order and the final consumer override remain unchanged.

## Cross-Cutting Decisions

Readability grouping must reveal semantic ownership rather than follow an
arbitrary maximum line length.

## Validation Requested

- Run the feedback validator and the React Skills catalog validation.
- Forward-test an interaction-heavy Button and a variant-heavy Card.
