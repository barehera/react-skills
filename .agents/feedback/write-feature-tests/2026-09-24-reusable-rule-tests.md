---
feedback_version: 1
target_skill: write-feature-tests
target_skill_version: 1.11.0
source_project: genie_website
captured_at: 2026-09-24
status: ready
---

# Skill Feedback: write-feature-tests

## Executive Summary

This report is for improving `write-feature-tests`, not for editing the originating product. The installed skill locks a product rule with a one-off assertion file. That does not scale when a rule gains a branch, when the rule itself changes, or when a remote-config default changes underneath a handwritten fixture. The accepted direction is one reusable case table per pure decision, one Business Logic block that stays on the production function, a rule that the failing case is updated in the same change, and a separate schema contract for baked defaults.

## Project Context

- Task: Add a feature-test safety net, then make it survive rule changes and remote-config default changes.
- Stack and conventions: React Skills v1.11.0. Vitest in Node. Feature adapters own product rules. Tests live in a `tests` folder, grouped by kind. No manual memoization.
- Skill invocation: `write-feature-tests` was followed while extracting decisions and adding unit tests. The user then asked for reusable, future-proof structure and for this report so the improved skill can be added upstream.
- Evidence reviewed: the installed `SKILL.md`, the local case runner, and the user's correction that fixtures do not notice a new remote-config value.

## Findings

### F-001: Express a pure decision as one case table

- Category: missing-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

A pure product decision has several branches. The agent wrote a new `expect` block for each branch, so every new branch invents another copy of the same test shape.

#### Evidence

Origin (do not ingest): `features/paddle/tests/unit/paywall-trigger.test.ts` started as repeated `expect(resolvePaywallTrigger(...)).toBe(...)` calls. The accepted local shape is `testRule` in `tests/rule-cases.ts`, with rows of `case`, `input`, and `expected`.

#### Current behavior

The skill tells the agent to add a test file named for the rule. It does not say how the branches inside that file are expressed, so the agent copies assertion blocks.

#### Preferred behavior

A pure decision is one function and one case table. Each row is one branch: a name, an input, and the expected result. Adding a branch adds a row. The runner holds no product value.

#### Proposed skill change

Add a required-workflow step and a short skill example to `SKILL.md`: call one shared case runner, `testRule(decide, cases)`, for a pure decision. The suite name is `decide.name`. Do not pass a separate string copy of that name. Put the runner contract in a reference only if the step outgrows the core file. Do not add a second runner per feature.

Skill example (ingest this):

```ts
testRule(canSubmit, [
  { case: 'submits a valid idle form', input: { valid: true, saving: false }, expected: true },
  { case: 'blocks a save already in flight', input: { valid: true, saving: true }, expected: false },
]);
```

#### Generalization test

Applies to a pure function, Zod transform, or store transition whose branches fit `input -> result`. Does not apply to a multi-step HTTP or cache contract, or to a browser journey. A counterexample is an MSW handler sequence: that stays a contract test, not a row of return values.

#### Acceptance criteria

- `SKILL.md` requires one case table per pure decision and forbids a product value inside the runner.
- On a fresh task, the agent adds a row for a new branch instead of a new hand-written `expect` block.
- The skill example uses a neutral decision, not an originating feature name.

### F-002: Update the failing case instead of loosening it

- Category: missing-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

A product rule changes. The existing case fails. An agent that only wants a green suite deletes or weakens that case.

#### Evidence

The user asked what happens when core logic changes, and whether the agent will update the necessary tests. The installed workflow says to add tests for rules this change added or changed. It does not say what to do with a case that fails because the rule moved.

#### Current behavior

The skill says to add tests for the changed rule. It does not forbid deleting or widening a failing assertion to restore a green run.

#### Preferred behavior

The case whose name is the changed branch is updated in the same change. Other rows stay. The old expected result stays until the new rule is the one the author meant to ship.

#### Proposed skill change

Add a "When a rule changes" section to `SKILL.md`: update the named case in the same change; do not delete or loosen a failing case to make the suite pass.

#### Generalization test

Applies whenever an existing case fails after a product-rule edit. Does not apply to a rename of the decision function with no behavior change; that update is an import fix, not a new expected result. A counterexample is a red test caused by a broken import: fix the import, leave the expected result.

#### Acceptance criteria

- `SKILL.md` states that a failing case is updated, not removed, in the same change as the rule.
- A fresh task that changes one branch edits that row and leaves the other rows intact.

### F-003: Keep baked defaults on a schema contract, not inside rule fixtures

- Category: missing-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

Rule tests build the smallest input that selects a branch. A new remote-config field, or a changed baked default, is invisible to those fixtures.

#### Evidence

The user said tests use mock data, so they will not notice when default values change or when a new remote-config value is added. The accepted local check parses every baked default with its schema and fails when a schema key and a default key diverge.

#### Current behavior

The skill says to pass the inputs the rule needs. It does not separate that fixture from the contract that the baked config still matches its schema, and it does not say to read a live default when the rule's result depends on that default.

#### Preferred behavior

A rule fixture passes only the inputs that select the branch. It does not copy a config snapshot. A separate contract test parses every baked default with its schema and fails when either side has a key the other does not. When a result depends on a specific default, the test reads that default from the same loader production uses.

#### Proposed skill change

Add a "Fixtures are not config defaults" section to `SKILL.md`. Name the contract: every schema key has a default, every default key has a schema, and the production default loader parses each one. Tell the agent to read the loader when the expected result is the current default, instead of pasting the previous value.

#### Generalization test

Applies to any schema-backed config file the app treats as a local source of truth. Does not apply to an input the rule receives from a caller, such as a selected tier or a pathname. A counterexample is a case row whose input is `{ tier: 'pro' }`: that row must not be replaced with a parsed config blob.

#### Acceptance criteria

- `SKILL.md` separates branch fixtures from the default-schema contract.
- `SKILL.md` tells the agent to read the production default loader when the assertion is about the current default.
- A fresh task that adds a required config field fails the contract test until the baked default is updated, without editing unrelated case rows.

### F-004: Keep the business-logic block on the production function only

- Category: missing-rule
- Severity: medium
- Recurrence: structural
- Confidence: high

#### Scenario

Feature code keeps one Business Logic / Why / Rule block on the owning function. The first attempt copied that block onto the test. The user rejected the copy because a second description has to be maintained by hand.

#### Evidence

The user asked for the same description on tests, then said they prefer a reusable solution instead of copying. Origin (do not ingest): the copied block was added above `testRule` in `features/consent/tests/unit/vendor-consent.test.ts` and then removed. The block remains only on `isVendorAllowed`.

#### Current behavior

The skill points at `$document-business-logic` but does not say where the single block lives once a test exists. Copying looks like reuse and then drifts.

#### Preferred behavior

The block stays on the production function. The test imports that function and locks its branches. Reading the test means reading the imported function's block. A test file does not repeat it.

#### Proposed skill change

Add a workflow step to `SKILL.md`: do not copy or paraphrase the `Business Logic` / `Why` / `Rule` block into a test. The imported function is the one owner. Route the wording of that block to `$document-business-logic`.

Skill example (ingest this):

```ts
testRule(canSubmit, [
  { case: 'submits a valid idle form', input: { valid: true, saving: false }, expected: true },
]);
```

The Business Logic block stays on `canSubmit`, not above this call.

#### Generalization test

Applies to every test that locks a documented function. Does not apply when a rule has no function yet; extract the function first, then document that function. A counterexample is pasting the block above `testRule`: that copy is the rejected shape.

#### Acceptance criteria

- `SKILL.md` forbids a Business Logic block in a test file.
- `SKILL.md` names the imported production function as the only owner of that block.
- On a fresh task, the test file contains no Business Logic comment, and the helper still has one.

## Cross-Cutting Decisions

- One pure decision, one case table, one runner. The suite name is the function name. The Business Logic block stays on the production function the test imports. Do not copy either one.
- A rule test and a config-schema contract answer different questions. Do not merge them.
- Hosted-runner names, banned browser vendors, and the local `tests/unit` folder layout stay project policy. Do not promote those names into a universal rule beyond what `SKILL.md` already scopes to this stack.
- React Skills v1.11.0.

## Validation Requested

- Update `write-feature-tests/SKILL.md` with the case-table step, the single-owner business-logic rule, the "when a rule changes" rule, and the defaults-contract rule.
- Fresh-task prompt: "A pure helper decides whether a form can submit from `{ valid, saving }` and already has a Business Logic / Why / Rule block. Add the tests without copying that block. Then change the rule so a saving form can still submit when `force` is true, and update only the helper block and the case that rule requires. Then add a required field to the app config schema and show which test fails before any case row changes."
