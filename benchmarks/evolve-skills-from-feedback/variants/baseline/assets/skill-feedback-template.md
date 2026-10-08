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

{{Summarize the task, the most important mismatch, and the accepted direction.
State that this report is for improving the named skill, not editing the
originating product feature.}}

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

{{Cite exact origin paths and narrow excerpts, test output, or direct user
feedback. Originating feature names belong here, not in the reusable proposal.}}

#### Current behavior

{{Describe what the agent or skill caused without guessing intent.}}

#### Preferred behavior

{{Describe the portable behavior and why it is better. Use vocabulary the skill
could publish rather than the originating feature's names.}}

#### Proposed skill change

{{Name the skill rule, reference, reusable example, or validator to change. Do
not instruct edits to consuming-app files unless this is explicitly classified
as project-convention.}}

#### Generalization test

{{State where this should apply, where it should not, and a counterexample.}}

#### Acceptance criteria

- {{Check observable on the skill artifact or its behavior on a fresh task}}
- {{A second skill-observable check, not a check of the originating feature}}

## Cross-Cutting Decisions

{{Record terminology, ownership rules, or user preferences shared by findings.}}

## Validation Requested

- {{Exact skill files, validator, or repository validation to run}}
- {{Realistic fresh-task prompt or portable fixture that does not name the
  originating feature}}
