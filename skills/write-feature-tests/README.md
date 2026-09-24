# Write Feature Tests

[React Skills catalog](../../README.md)

Lock product rules with reusable case tables and a baked-defaults contract.

## Install

```bash
npx shadcn@latest add barehera/react-skills/write-feature-tests
```

## Use

```text
Use $write-feature-tests to lock the submit decision in this feature with one case table, without copying its Business Logic block into the test.
```

```text
Use $write-feature-tests: the refund rule changed so partial refunds are allowed after shipping. Update the tests for that branch only.
```

```text
Use $write-feature-tests to add a contract test so every remote-config schema key has a baked default that the production loader parses.
```

## Guidance

- [Canonical instructions](SKILL.md)
- [case tables and contracts](references/case-tables.md)

The complete example in [examples/rule-tests](examples/rule-tests) runs with
Vitest in Node. Installation adds guidance, not runtime dependencies.

## Update

```bash
npx shadcn@latest add barehera/react-skills/write-feature-tests --overwrite
```
