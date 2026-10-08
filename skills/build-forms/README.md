# Build Forms

[← React Skills catalog](../../README.md)

Design, implement, refactor, or audit accessible React form systems with
compact field adapters over shadcn-style compound slots, repository-native
form and validation libraries, browser autofill/mobile input behavior, dynamic
collections, and independent workflow orchestration.

The skill first looks for the repository's incumbent form layer, a typed form
factory and its field adapters, and builds new forms on it in its own
vocabulary. Only a repository without one gets the skill's fresh foundation.
Audits flag feature forms that bypass the typed root: raw `useForm` calls,
`<Form {...form}>` spreads, prop-drilled pending state, and inline
`FormField` render blocks.

Feature code renders one compact adapter per field, such as
`<SelectField control name label options slotProps />`. A typed `slotProps`
object, keyed by primitive part (`selectTrigger`, `selectContent`, ...),
configures secondary parts and cannot override the IDs, values, refs, or ARIA
the adapter owns. Custom anatomy composes the open `Root`, `Label`, `Control`,
`Description`, and `Error` slots the adapter is built from.

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
Use $build-forms to refactor these create and edit forms onto our shared form
factory and field adapters. Add a SelectField adapter in the same style if one
is missing, and read pending state from the form root.
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
