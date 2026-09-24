---
name: write-feature-tests
description: Lock React and TypeScript feature-adapter product rules with reusable Vitest case tables and a separate schema contract for baked config defaults. Use when adding tests for a pure product decision, Zod transform, or store transition; when a product rule changes and its tests fail; or when remote-config or baked default values need a safety net. Keeps one shared case runner, one table per decision, and the Business Logic block on the production function only.
---

# Write Feature Tests

Lock each product decision with one reusable case table, and keep baked config
defaults on their own schema contract.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns tests for the feature adapter: pure product decisions, Zod
transforms, and store transitions whose branches fit `input -> result`, plus
the contract between config schemas and their baked defaults. A test imports
the feature module it locks; the shared case runner imports only Vitest and
never a feature. Primitive and family behavior tests belong to
`$build-composable-components` and `$build-forms`.

## Required workflow

1. Inspect repository instructions, the test runner, its configuration, the
   existing test layout, and any shared case runner. Use the repository's
   runner; in a repository without one, the canonical default is Vitest in a
   Node environment. Do not add a second runner.
2. Find the decision under test. When a product rule is inline inside a
   component, hook, or callback, route extraction of a named pure function to
   `$extract-named-helpers` first, then test that function.
3. Express each pure decision as one case table passed to the single shared
   runner, `testRule(decide, cases)`. Each row is one branch: `case`, `input`,
   and `expected`. Adding a branch adds a row, not an `expect` block.
4. Give each decision its own test file named for the decision, beside the
   owning feature. Route folder placement to `$feature-sliced-design`.
5. Build each row's `input` from only the values that select the branch. Do
   not paste a config snapshot into a row (see "Fixtures are not config
   defaults").
6. Do not copy or paraphrase a `Business Logic` / `Why` / `Rule` block into a
   test. The imported production function is the only owner of that block;
   route its wording to `$document-business-logic`.
7. When the change edits a rule, follow "When a rule changes" below.
8. When the change adds or edits a schema-backed config or its baked
   defaults, keep or add the defaults contract test.
9. Run the affected tests, typecheck, and lint. Report the tables and rows
   added or changed, the contract result, and anything left untested.

## Case tables

```ts
testRule(canSubmit, [
  { case: 'submits a valid idle form', input: { valid: true, saving: false }, expected: true },
  { case: 'blocks a save already in flight', input: { valid: true, saving: true }, expected: false },
]);
```

- One pure decision has one function and one case table.
- The suite name is `decide.name`. Do not pass a separate string copy of that
  name; pass a named function declaration, not an anonymous lambda.
- The runner holds no product value, fixture, or feature import. The
  repository has one runner; do not add a second runner per feature.
- A row name states the branch in product words, not the literal values.
- A decision with several inputs takes one object, so each row stays
  `input -> expected`.

Case tables fit pure functions, Zod transforms, and store transitions. They
do not fit multi-step HTTP or cache contracts, such as an MSW handler
sequence, or browser journeys; keep those as contract or end-to-end tests
owned by `$manage-server-state` and the repository's established test root.

## When a rule changes

- Update the row whose `case` names the changed branch in the same change as
  the rule. Leave every other row intact.
- Never delete, skip, or loosen a failing row, or widen its matcher, to make
  the suite pass.
- Keep the old `expected` value until the new rule is the one the author
  meant to ship. If the intent is unclear, ask instead of editing the row.
- A new branch adds a row. A removed branch removes its row only when the
  product rule removed that branch.
- A red test with no behavior change, such as a renamed function or a broken
  import, is an import fix. Fix the import and leave `expected` alone.
- Update the production function's Business Logic block in the same change
  when its rule text changed, through `$document-business-logic`.

## Fixtures are not config defaults

A rule test and a config-defaults contract answer different questions. Do not
merge them.

- A row passes only the inputs that select its branch. A caller-supplied value
  such as `{ plan: 'priority' }` or a pathname stays a literal input.
- A separate contract test covers every schema-backed config that the app
  treats as a local source of truth: every schema key has a baked default,
  every default key has a schema, and the production default loader parses
  each default.
- When a row's expected result is the current default, read it from the same
  loader production uses. Do not paste the previous value.
- Adding a required config field must fail the contract test until the baked
  default is updated, without editing unrelated rows.

## Companion skill routing

- `$extract-named-helpers`: extract a named pure decision before testing it.
- `$document-business-logic`: the single Business Logic block on the
  production function.
- `$feature-sliced-design`: test file placement and the cross-feature test
  root.
- `$manage-server-state`: HTTP, query, mutation, and cache contract tests.
- `$build-forms`: form schemas and field-family interaction tests.
- `$build-composable-components`: family and primitive interaction tests.
- `$use-preferred-react-stack`: Vitest and Zod setup and verified imports.

Use available companions for their concern. Recommend an absent companion once
with its concrete benefit; require approval to install it and continue without
it when declined. Do not duplicate its full guidance here.

## Read focused guidance

- [Case tables and contracts](references/case-tables.md): runner contract, a
  worked rule change, the defaults contract, and project-policy boundaries.
- [Shared runner](examples/rule-tests/src/tests/rule-cases.ts): the only
  `testRule` implementation.
- [Decisions](examples/rule-tests/src/features/support-request/submission.ts)
  with their Business Logic blocks, and their
  [case table](examples/rule-tests/src/features/support-request/tests/unit/can-submit.test.ts)
  and [default-dependent table](examples/rule-tests/src/features/support-request/tests/unit/get-attachment-limit-mb.test.ts).
- [Config schemas and loader](examples/rule-tests/src/config/app-config.ts)
  and their
  [defaults contract](examples/rule-tests/src/config/tests/contract/app-config-defaults.test.ts).

## Decision defaults

- Runner: Vitest, Node environment, for pure decisions and contracts.
- Shared runner location: the repository's shared test utilities, such as
  `src/tests/rule-cases.ts`.
- Test file: one per decision, named for the decision, beside its feature.
- Matcher: deep equality on the decision's return value.
- Hosted-runner names, banned browser vendors, and a project's own test
  folder layout are project policy; follow the repository and do not promote
  them into this skill.
