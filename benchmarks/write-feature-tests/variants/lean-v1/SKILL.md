---
name: write-feature-tests
description: Lock React and TypeScript feature-adapter product rules with reusable Vitest case tables and a separate schema contract for baked config defaults. Use when adding tests for a pure product decision, Zod transform, or store transition; when a product rule changes and its tests fail; when remote-config or baked default values need a safety net; or when auditing feature tests for change-detectors or over-engineering. Keeps one shared case runner, one table per decision, and the Business Logic block on the production function only.
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
never a feature. Primitive and family interaction tests belong to
`$build-composable-components` and `$build-forms`, but a pure
`input -> result` transform in a business-agnostic library may use the same
runner and layout.

## Required workflow

1. Read the repository instructions, test runner and configuration, test
   layout, and any shared case runner. Use the repository's runner, or Vitest
   in a Node environment when it has none. Never add a second runner; reuse an
   existing table runner under its own name instead of adding `testRule`.
2. When a product rule is inline in a component, hook, or callback, extract a
   named pure function through `$extract-named-helpers` first, then test it.
3. Lock each pure decision with one case table passed to the shared runner,
   `testRule(decide, cases)`.
4. Give each decision its own test file, named for the decision, beside the
   owning feature; do not merge decision files to reduce file count. Route
   folder placement to `$feature-sliced-design`.
5. Do not copy or paraphrase a `Business Logic` / `Why` / `Rule` block into a
   test. The imported production function is the only owner of that block;
   route its wording to `$document-business-logic`.
6. When a schema-backed config or its baked defaults change, keep or add the
   defaults contract test.
7. When auditing tests for over-engineering, remove only duplicate suites,
   test-only adapters, and change-detectors, covering untested behavior
   first. Keep product-decision tables, pure library tables, and one file per
   decision.
8. Run the affected tests, typecheck, and lint. Report the tables and rows
   added or changed, the contract result, and anything left untested.

## Case tables

```ts
testRule(canSubmit, [
  { case: 'submits a valid idle form', input: { valid: true, saving: false }, expected: true },
  { case: 'blocks a save already in flight', input: { valid: true, saving: true }, expected: false },
]);
```

- Each row is one branch: `case`, `input`, and `expected`. A new branch adds a
  row, not an `expect` block.
- The suite name is `decide.name`, so pass a named function declaration, not
  an anonymous lambda or a separate string copy of the name.
- The runner holds no product value, fixture, feature import, or per-feature
  variant. A decision that does not fit `input -> result` is not a case-table
  decision; do not bend the runner to fit it.
- A row name states the branch in product words, not the literal values.
- A decision with several inputs takes one object, so each row stays
  `input -> expected`. An existing positional function, such as the generic
  guard `includesOption(options, value)`, gets plain `it` cases instead of a
  test-only adapter that reshapes its arguments.
- A map whose values are product choices (status -> tone, plan -> limit) keeps
  its table even when typed `satisfies Record<K, V>`: the type proves every key
  exists, not that each maps to the right value. Pass a named lookup, declared
  in the test, that only indexes the map. A mechanical map, such as an enum
  mapped to its own string, restates its keys and gets no table.

Case tables fit pure functions, product-chosen maps, Zod transforms, and
store transitions passed as `{ state, action }`. A test that observes calls,
timing, or rendered output does not fit: multi-step HTTP or cache contracts,
such as an MSW handler sequence, stay with `$manage-server-state`, and browser
journeys stay with their owning skill or the repository's end-to-end root.

## When a rule changes

- Update the row whose `case` names the changed branch in the same change as
  the rule, and leave every other row intact.
- Never delete, skip, or loosen a failing row, or widen its matcher, to make
  the suite pass.
- Keep the old `expected` value until the new rule is the one the author
  meant to ship. If the intent is unclear, ask instead of editing the row.
- A new branch adds a row; a branch's row is removed only when the product
  rule removed that branch.
- A red test with no behavior change, such as a renamed function or a broken
  import, is an import fix: fix the import and leave `expected` alone.
- A test that only restates a constant's literal is a
  [change-detector](references/case-tables.md#change-detectors), not a rule
  test. Cover the behavior it stands for, then delete it.
- Update the production function's Business Logic block in the same change
  when its rule text changed, through `$document-business-logic`.

## Fixtures are not config defaults

A rule test and a config-defaults contract answer different questions. Do not
merge them.

- A row's `input` holds only the values that select its branch, never a config
  snapshot. A caller-supplied value such as `{ plan: 'priority' }` or a
  pathname stays a literal input.
- When a row's expected result is the current default, read it from the same
  loader production uses, because a pasted literal keeps passing after the
  default moves.
- A separate contract test covers every schema-backed config that the app
  treats as a local source of truth: every schema key has a baked default,
  every default key has a schema, and the production default loader parses
  each default. Adding a required config field must fail it until the baked
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

Recommend a missing companion once with its concrete benefit, install it only
with approval, and continue without it when declined.

## References

- [case-tables.md](references/case-tables.md): change-detectors, a worked rule
  change, the defaults contract, and why each decision keeps its own file.
- [examples/rule-tests](examples/rule-tests): the type-checked shared runner
  (the only `testRule` implementation), decisions with their tables, a
  product-chosen map, a default-dependent table, and the defaults contract.

## Decision defaults

- Matcher: deep equality on the decision's return value.
- Shared runner: the repository's shared test utilities, such as
  `src/tests/rule-cases.ts`.
- The test folder name and location (such as `tests/unit` or `__tests__`),
  hosted-runner names, banned browser vendors, coverage thresholds, and
  snapshot policy are project policy: follow the repository and do not promote
  them into this skill. One file per decision is this skill's granularity, not
  folder policy.
