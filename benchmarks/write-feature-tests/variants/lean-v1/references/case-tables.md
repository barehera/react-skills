# Case tables and contracts

## Contents

- [Change-detectors](#change-detectors)
- [Worked rule change](#worked-rule-change)
- [Defaults contract](#defaults-contract)
- [One file per decision](#one-file-per-decision)

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

A saving form can now submit when the user forces it. The `canSubmit` table in
`SKILL.md` becomes:

```ts
testRule(canSubmit, [
  { case: 'submits a valid idle form', input: { valid: true, saving: false, force: false }, expected: true },
  { case: 'blocks an unforced save already in flight', input: { valid: true, saving: true, force: false }, expected: false },
  { case: 'submits a forced save already in flight', input: { valid: true, saving: true, force: true }, expected: true },
]);
```

The input type gains `force`, and the new branch adds one row. The blocking
row keeps `expected: false`; only its name now states the narrower branch. It
is not deleted, and its matcher is not widened.

## Defaults contract

Baked defaults are the values the app uses before, or instead of, remote
configuration. Treat them as a trust boundary: parse them with the Zod schema
the app uses for the live value.

The contract compares key sets as well as parsing, because parsing alone would
strip or accept an orphaned default key and miss an optional schema key with
no default. It parses through the production loader, not a test-only parse, to
prove the code path the app runs.

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
the production loader when the test file loads, so a broken baked default makes
that file fail to collect. With one file per decision, the defaults contract
names the mismatched key, the default-dependent table fails as production
would, and unrelated tables still run.

```text
Keep (one file per decision; a new rule adds a file):
  tickets/tests/unit/can-reopen-ticket.test.ts
  tickets/tests/unit/ticket-priority-tone.test.ts
  tickets/tests/unit/has-breached-sla.test.ts

Avoid (merged only to reduce file count):
  tickets/tests/unit/ticket-rules.test.ts   // three testRule calls in one file
```

When a repository documents a per-module test policy in its own instructions,
follow it and record the deviation; do not introduce the merge on the grounds
that it is simpler. This layout governs case tables of pure decisions only;
interaction, contract, and end-to-end tests follow their owning skill and the
repository.
