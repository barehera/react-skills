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

{{Summarize the task, the most important mismatch, and the accepted direction.}}

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

{{Describe the task and constraints that exposed the issue.}}

#### Evidence

{{Cite exact paths and narrow excerpts, test output, or direct user feedback.}}

#### Current behavior

{{Describe what the agent or skill caused without guessing intent.}}

#### Preferred behavior

{{Describe the final accepted behavior and why it is better.}}

#### Proposed skill change

{{Name the rule, reference, example, validator, or project-only instruction.}}

#### Generalization test

{{State where this should apply, where it should not, and a counterexample.}}

#### Acceptance criteria

- {{Observable check one}}
- {{Observable check two}}

## Cross-Cutting Decisions

{{Record terminology, ownership rules, or user preferences shared by findings.}}

## Validation Requested

- {{Skill or repository validation}}
- {{Realistic forward-test prompt or example}}
