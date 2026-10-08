# Build Forms

[← React Skills catalog](../../README.md)

Design, implement, refactor, or audit accessible React form systems with
shadcn-style compound fields, repository-native form and validation libraries,
browser autofill/mobile input behavior, dynamic collections, and independent
workflow orchestration.

Every visible part owns its natural primitive props. Consumers configure
`SelectFieldTrigger`, `SelectFieldContent`, `CheckboxFieldLayout`, and other
slots directly instead of passing `triggerProps`, `contentProps`, or similar
bags through a field root. Shared roots still own registration, IDs, invalid
state, refs, and ARIA relationships once.

The skill keeps Form, Stepper, and surrounding Card, Dialog, or Sheet primitives
separate. A feature adapter may validate the active step and advance navigation,
but the skill does not create fused `StepperForm`, `CardForm`, or `DialogForm`
APIs. Each component keeps its own props, state, and behavior.

Each consuming feature keeps its schema, inferred values, defaults/options, and
typed Form/hook together in a cohesive `<feature>-form.ts` module by default.
Distinct UI sections stay in `components`, while reusable bindings and shared
helpers remain in `components/ui` and `lib`. Feature components consume the typed form
hook instead of threading a React Hook Form instance through every section prop.
The typed root accepts `resolver`, `defaultValues`, `mode`, and the remaining
React Hook Form options directly, then creates the form instance once.
When descendants also need non-field values supplied by the feature screen,
the factory can bind a second properties type and provide those values through
one scoped Zustand store per mounted form. Descendants select only the property
they need; form values remain owned by React Hook Form.

When a form crosses into API contracts, mutations, authentication, or cache
synchronization, the skill checks for `manage-server-state` and recommends
installing it when absent. The companion remains optional and is installed only
with user approval.

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills build-forms
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/build-forms/`, plus one pointer each for Claude Code, Cursor,
GitHub Copilot, or Windsurf. Codex reads `.agents/skills` directly. Skip the
question with `--agent`, for example `--agent cursor`.

Or install it with shadcn, choosing the item for your agent:

```bash
npx shadcn@latest add barehera/react-skills/build-forms-cursor
```

Use `-claude`, `-copilot`, or `-windsurf` instead of `-cursor`; for Codex
alone, add `barehera/react-skills/build-forms`. See the
[install guide](../../README.md#install) for every option.

## Use

```text
Use $build-forms to refactor this React Hook Form screen into composable shadcn
field families. Keep each slot's primitive props direct and remove prop bags.
```

```text
Use $build-forms to create a multi-step onboarding form. Keep Form and Stepper
independent, support conditional fields and field arrays, and validate only the
active step before navigation.
```

## Guidance

- [Canonical skill instructions](SKILL.md)
- [Form architecture](references/architecture.md)
- [Field contracts](references/field-contracts.md)
- [Workflows and submission](references/workflows-and-submission.md)
- [Review and testing](references/review-and-testing.md)
- [Complete typed feature-form example](examples/typed-feature-form)

The shared `.agents/skills/VERSION` file records the React Skills release that
supplied the installed workflow.

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose.

Companion guidance: [library defaults](../use-preferred-react-stack/README.md) and [helper extraction](../extract-named-helpers/README.md). Existing form, server-state, and component ownership stays with its focused skill.
