# Case tables and contracts

## Contents

- [Runner contract](#runner-contract)
- [What fits a case table](#what-fits-a-case-table)
- [Worked rule change](#worked-rule-change)
- [Defaults contract](#defaults-contract)
- [One file per decision](#one-file-per-decision)
- [Project policy boundaries](#project-policy-boundaries)

## Runner contract

The repository has exactly one case runner. It is generic test
infrastructure, so it lives with shared test utilities and imports only the
test framework.

```ts
export function testRule<Input, Result>(
  decide: (input: Input) => Result,
  cases: readonly RuleCase<Input, Result>[],
): void
```

- `describe(decide.name)` names the suite. The runner throws when the name is
  empty, so an anonymous lambda cannot produce an unnamed suite.
- `it.each(cases)` runs one test per row and uses `case` as the test name.
- Each row asserts deep equality between `decide(input)` and `expected`.
- `Input` and `Result` are inferred from `decide`, so a row with the wrong
  input shape or result type fails typecheck.
- The runner never contains a product value, a fixture, a feature import, or
  a per-feature variant. A decision whose shape does not fit `input -> result`
  is not a case-table decision; do not bend the runner to fit it.

If the repository already has an equivalent table runner, use it and keep its
name. Do not add `testRule` beside it.

## What fits a case table

| Fits | Does not fit |
| --- | --- |
| A pure predicate or calculation in a feature adapter | An MSW handler sequence or Axios transport contract |
| A Zod transform or refinement from input to parsed result | A TanStack Query cache update across several calls |
| A store transition from `(state, action)` to next state, passed as one object | A browser journey, focus order, or keyboard flow |

A store transition fits when the test passes `{ state, action }` and
expects the next state. A test that must observe calls, timing, or rendered
output belongs to the owning skill's contract or interaction tests.

## Worked rule change

A saving form can now submit when the user forces it. Before:

```ts
testRule(canSubmit, [
  { case: 'submits a valid idle form', input: { valid: true, saving: false }, expected: true },
  { case: 'blocks a save already in flight', input: { valid: true, saving: true }, expected: false },
]);
```

After the rule change, the input type gains `force`, the named branch is
updated, and one row is added for the new branch:

```ts
testRule(canSubmit, [
  { case: 'submits a valid idle form', input: { valid: true, saving: false, force: false }, expected: true },
  { case: 'blocks an unforced save already in flight', input: { valid: true, saving: true, force: false }, expected: false },
  { case: 'submits a forced save already in flight', input: { valid: true, saving: true, force: true }, expected: true },
]);
```

- The `Rule` line of the production function's Business Logic block changes
  in the same commit, through `$document-business-logic`. The test file still
  has no block.
- The blocking row keeps `expected: false`; its name now states the narrower
  branch. It is not deleted, and its matcher is not widened.
- If the author had not confirmed that a forced save should submit, the
  failing row would stay as it was and the agent would ask.

A red run caused by renaming `canSubmit` with no behavior change is fixed in
the import and the `testRule` call. No `expected` value changes.

## Defaults contract

Baked defaults are the values the app uses before, or instead of, remote
configuration. Treat them as a trust boundary: parse them with the Zod schema
the app uses for the live value.

The contract test checks three things for every config name:

1. the set of config names in the schemas equals the set in the defaults;
2. each default has exactly the keys its schema declares;
3. the production default loader parses each default without throwing.

Key comparison catches an optional schema key with no default and an
orphaned default key that parsing alone would strip or accept. Parsing
through the production loader, rather than a test-only parse, proves the code
path the app runs.

When a rule's expected result is the current default, read it from the same
loader:

```ts
{
  case: 'follows the configured standard limit',
  input: 'standard',
  expected: loadDefaultAppConfig('supportRequest').maxAttachmentMb,
}
```

A literal such as `expected: 10` would keep passing after the default moved
and would not describe the rule. A caller-supplied input such as
`'priority'` stays literal; never replace it with a parsed config object.

## One file per decision

A row that reads a default evaluates the production loader when the test file
loads. If a baked default is broken, that file fails to collect. One file per
decision keeps that failure local: the defaults contract names the mismatched
key, the default-dependent table fails as production would, and unrelated
tables still run.

## Project policy boundaries

These remain consuming-repository policy, not rules of this skill:

- the test folder naming and grouping inside a feature, such as `tests/unit`;
- hosted CI runner names and browser vendor allow or deny lists;
- coverage thresholds and snapshot policy.

Follow the repository's documented choices and route placement disputes to
`$feature-sliced-design`.
