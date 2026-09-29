# Case tables and contracts

## Contents

- [Runner contract](#runner-contract)
- [What fits a case table](#what-fits-a-case-table)
- [Change-detectors](#change-detectors)
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
- For a map, pass a named lookup declared in the test that only indexes the
  map. Do not wrap an existing function in an adapter that changes its
  arguments; test it with plain cases.

If the repository already has an equivalent table runner, use it and keep its
name. Do not add `testRule` beside it.

## What fits a case table

| Fits | Does not fit |
| --- | --- |
| A pure predicate or calculation in a feature adapter or a business-agnostic library | An MSW handler sequence or Axios transport contract |
| A Zod transform or refinement from input to parsed result | A TanStack Query cache update across several calls |
| A store transition from `(state, action)` to next state, passed as one object | A browser journey, focus order, or keyboard flow |
| A constant lookup map whose values are product choices (status → tone, plan → limit) | A multi-argument or positional guard that would need a reshaping adapter |

A store transition fits when the test passes `{ state, action }` and
expects the next state. A test that must observe calls, timing, or rendered
output belongs to the owning skill's contract or interaction tests.

A product-chosen map keeps its table even when it is typed
`satisfies Record<K, V>`: the type proves that every key exists, not that a
key maps to the right value. The row names state the product reason:

```ts
// Production, in the feature adapter: the values are product choices.
export const SUPPORT_REQUEST_STATUS_TONE = {
  open: "neutral",
  "waiting-on-customer": "warning",
  resolved: "success",
  expired: "danger",
} as const satisfies Record<SupportRequestStatus, StatusTone>

// Test: a named lookup that only indexes the map.
function supportRequestStatusTone(status: SupportRequestStatus) {
  return SUPPORT_REQUEST_STATUS_TONE[status]
}

testRule(supportRequestStatusTone, [
  { case: "a request waiting on the customer asks for attention", input: "waiting-on-customer", expected: "warning" },
  { case: "an expired request can no longer be reopened", input: "expired", expected: "danger" },
])
```

A map whose values are mechanical, such as an enum mapped to its own string or
an i18n key equal to the enum name, restates its keys and gets no table:
`{ OPEN: "OPEN", CLOSED: "CLOSED" }` needs none.

A positional guard such as `includesOption(options, value)` is not a
case-table decision. Do not write a same-named one-object wrapper in the test
only so it fits the runner; give it plain `it` cases.

## Change-detectors

A change-detector copies its expected value from the implementation without a
product reason, so it fails on every edit, including correct ones.

Product-choice check: would a reviewer call a row wrong for a product reason,
independently of the code? If yes, the row is a decision and stays. If the
expected value is only the constant's own literal, the test is a
change-detector.

```ts
// Change-detector: the expected value is copied from the declaration.
it("clears filters", () => {
  expect(CLEARED_TICKET_FILTERS).toEqual({ search: null, status: null, page: null })
})

// Behavior: the rule the constant exists for.
testRule(toResetTicketFilters, [
  {
    case: "reset clears every filter and keeps the sort",
    input: { search: "x", status: "OPEN", page: 3, sort: "createdAt" },
    expected: { search: null, status: null, page: null, sort: "createdAt" },
  },
])
```

Delete a change-detector in this order: confirm the behavior the constant
supports is tested through its consumer, or add that test first (a case table,
or an interaction test owned by its skill); then delete the change-detector.

Not change-detectors: product-chosen maps, the defaults contract (it compares
schema keys with default keys and catches drift between two artifacts), and
snapshot tests the repository adopted as policy.

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

One file per decision is this skill's default layout, with or without baked
defaults:

- a new rule adds a file, or rows in its own file, and never edits a
  neighbor's file;
- a decision is found by its file name, and a red file name names the broken
  rule;
- history and review diffs stay per decision;
- a collection failure in one file stays local.

The last reason matters most for config. A row that reads a default evaluates
the production loader when the test file loads. If a baked default is broken,
that file fails to collect. One file per decision keeps that failure local: the
defaults contract names the mismatched key, the default-dependent table fails
as production would, and unrelated tables still run.

```text
Keep (one file per decision; a new rule adds a file):
  tickets/tests/unit/can-reopen-ticket.test.ts
  tickets/tests/unit/ticket-priority-tone.test.ts
  tickets/tests/unit/has-breached-sla.test.ts

Avoid (merged only to reduce file count):
  tickets/tests/unit/ticket-rules.test.ts   // three testRule calls in one file
```

Reducing the file count is not a reason to merge. When a repository documents
a per-module test policy in its own instructions, follow it and record the
deviation; do not introduce the merge on the grounds that it is simpler. This
layout governs case tables of pure decisions only; interaction, contract, and
end-to-end tests follow their owning skill and the repository.

## Project policy boundaries

These remain consuming-repository policy, not rules of this skill:

- the test folder name and location inside a feature, such as `tests/unit` or
  `__tests__` (not the one-file-per-decision granularity);
- hosted CI runner names and browser vendor allow or deny lists;
- coverage thresholds and snapshot policy.

Follow the repository's documented choices and route placement disputes to
`$feature-sliced-design`.
