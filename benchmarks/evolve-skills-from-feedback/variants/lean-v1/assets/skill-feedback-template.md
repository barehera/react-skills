---
feedback_version: 1
target_skill: {{target-skill}}
target_skill_version: {{version-or-commit}}
source_project: {{repository-name-or-redacted-id}}
captured_at: {{YYYY-MM-DD}}
status: draft
---

# Skill Feedback: {{target-skill}}

## Executive Summary

{{The task, the most important mismatch, and the accepted direction. This
report improves the named skill, not the originating product feature.}}

## Project Context

- Task: {{development task}}
- Stack and conventions: {{relevant framework, versions, and repository rules}}
- Skill invocation: {{how the skill was used}}
- Evidence reviewed: {{diffs, files, tests, screenshots, or user corrections}}

## Findings

### F-001: {{short outcome-oriented title}}

- Category: {{missing-rule | ambiguous-rule | bad-example | missing-example | validation-gap | tool-limitation | project-convention | false-positive}}
- Severity: {{low | medium | high | critical}}
- Recurrence: {{once | repeated | structural}}
- Confidence: {{low | medium | high}}

#### Scenario

{{The task and constraints that exposed the issue.}}

#### Evidence

{{Exact origin paths and narrow excerpts, test output, or direct user
feedback. Originating feature names belong here only.}}

#### Current behavior

{{What the agent or skill caused, without guessing intent.}}

#### Preferred behavior

{{The portable behavior and why it is better, in vocabulary the skill could
publish.}}

#### Proposed skill change

{{The skill rule, reference, reusable example, or validator to change.}}

#### Generalization test

{{Where this should apply, where it should not, and a counterexample.}}

#### Acceptance criteria

- {{Check observable on the skill artifact or its behavior on a fresh task}}
- {{A second skill-observable check}}

## Cross-Cutting Decisions

{{Terminology, ownership rules, or user preferences shared by findings.}}

## Validation Requested

- {{Exact skill files, validator, or repository validation to run}}
- {{Fresh-task prompt or portable fixture that does not name the originating
  feature}}
