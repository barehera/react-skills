# Write Feature Tests

[React Skills catalog](../../README.md)

Lock product rules with reusable case tables and a baked-defaults contract.

## Install

From your project root:

```bash
npx --yes git+ssh://git@react-skills/barehera/react-skills.git write-feature-tests
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/write-feature-tests/`, plus one pointer each for Claude Code, Cursor,
GitHub Copilot, or Windsurf. Codex reads `.agents/skills` directly. Skip the
question with `--agent`, for example `--agent cursor`.

With Claude Code, `--global` installs it once for every project instead. See
the [install guide](../../README.md#install) for access and every
option.

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
npx --yes git+ssh://git@react-skills/barehera/react-skills.git update
```

This updates all installed React Skills for the agents you chose.
