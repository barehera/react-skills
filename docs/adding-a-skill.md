# Adding or improving a skill

## Contents

- [Required reading](#required-reading)
- [Choose the contribution path](#choose-the-contribution-path)
- [Design within the catalog](#design-within-the-catalog)
- [Use the shared skill shape](#use-the-shared-skill-shape)
- [Create the package](#create-the-package)
- [Build canonical examples](#build-canonical-examples)
- [Add the catalog entry](#add-the-catalog-entry)
- [Apply feedback](#apply-feedback)
- [Validate](#validate)
- [Open the pull request](#open-the-pull-request)

## Required reading

Before editing a source skill:

1. Read [technology-stack.md](technology-stack.md).
2. Read the target skill's `SKILL.md`, routed references, examples, README,
   agent metadata, and registry item.
3. Read the closest neighboring skill to reuse catalog terminology, companion
   routing, file shape, and validation depth.
4. When the proposal comes from real project behavior, read
   [the feedback skill](../skills/evolve-skills-from-feedback/SKILL.md) and its
   [canonical report format](../skills/evolve-skills-from-feedback/references/feedback-format.md).

The catalog is intentionally centered on React, TypeScript, shadcn/Radix,
compound components, React Hook Form, Zod, scoped Zustand, TanStack Query, and
Axios. Do not design a new source skill as a framework-neutral abstraction.

## Choose the contribution path

Use one of these paths:

- **Capture feedback** when a product-project task exposed a missing rule, bad
  example, ambiguous instruction, or validation gap. Produce a canonical report
  before changing source guidance.
- **Improve an existing skill** when its current responsibility already covers
  the requested behavior. Ingest the feedback, decide every finding, update the
  smallest durable resources, and validate the complete package.
- **Create a new skill** only when the workflow has its own trigger, ownership
  boundary, reusable guidance, and examples. Do not create a second skill that
  merely restates forms, server state, or composable-component rules.

Prefer extending the owning skill over fragmenting one concern across several
packages.

## Design within the catalog

Write a short model before files:

- the requests that should trigger the skill;
- the state, behavior, and artifacts the skill owns;
- the concerns it explicitly does not own;
- the existing skills it composes with;
- the preferred-stack packages exercised by its canonical example;
- the evidence and acceptance checks that prove the workflow works.

Use the responsibility map in [technology-stack.md](technology-stack.md).
Form, Stepper, visual components, scoped Zustand state, TanStack Query state,
Zod validation, and Axios transport retain separate owners even when a feature
composes several of them.

When a neighboring skill can handle part of a task, add explicit companion
routing. Explain the concrete benefit, recommend installation only when needed,
and require user approval before installing it.

## Use the shared skill shape

Keep `SKILL.md` concise and imperative. Use this order when the sections apply:

1. YAML frontmatter with only `name` and `description`;
2. one-sentence outcome;
3. shared catalog version handoff;
4. required workflow;
5. core contracts;
6. companion-skill routing;
7. direct links to focused references;
8. decision defaults for repositories without an established convention.

Put detailed conditional guidance in `references/`, realistic code in
`examples/`, deterministic checks in `scripts/`, and reusable output material
in `assets/`. Link each resource directly from `SKILL.md`; avoid deep reference
chains and include a contents list in references longer than 100 lines.

The human-facing `README.md` should explain the outcome, installation, two or
three realistic invocation prompts, focused guidance links, and update command.
Keep it useful to contributors without repeating the complete skill.

## Create the package

Each skill is one self-contained registry item:

```text
VERSION
skills/
  skill-name/
    SKILL.md
    README.md
    registry.json
    agents/
      openai.yaml
    references/
    examples/
    scripts/
    assets/
    adapters/
```

Only create optional folders that the skill uses.

- Root `VERSION` is generated from the canonical GitHub release. Do not edit it
  manually or add a skill-local version.
- Name the skill with a short, lowercase, verb-led phrase.
- Keep the folder, frontmatter name, registry item, install path, and invocation
  name identical.
- Do not add `react` merely as a namespace; the whole catalog is React-focused.
- Generate or update `agents/openai.yaml` from the finished skill so its display
  name, short description, and default prompt remain accurate.
- Use direct imports in examples. Do not add re-export-only barrel files.

Use the official skill-creator workflow when available. For an existing skill,
edit in place instead of reinitializing its directory.

## Build canonical examples

Canonical examples establish the repository's preferred skeleton. They are not
a menu of interchangeable libraries.

- Use the technologies named in [technology-stack.md](technology-stack.md) for
  every included concern.
- Reuse shadcn primitives instead of raw styled controls when a primitive
  exists.
- Use compound parts whose props belong to the element or primitive each part
  renders.
- Use React Hook Form and Zod for form examples, scoped Zustand for justified
  multi-descendant client state, TanStack Query for remote state, and Axios for
  HTTP transport.
- Keep schemas, values, options, and feature policy cohesive until an artifact
  becomes independently reusable.
- Use a domain model unrelated to private user examples.
- Include a complete composition that type-checks against real package APIs.
- Route cross-boundary work to the owning skill instead of embedding a second
  skill inside the example.

Adaptation guidance may explain how an installed skill respects a coherent
existing repository. It must not make the source example indecisive.

## Add the catalog entry

Add the skill registry to root `registry.json`:

```json
{
  "include": [
    "skills/manage-server-state/registry.json",
    "skills/skill-name/registry.json"
  ]
}
```

Paths in a skill registry are relative to that skill folder. Publish every
resource needed by the agent, but do not publish the human-facing `README.md` or
local `registry.json`. Depend on the shared version item:

```json
{
  "registryDependencies": [
    "barehera/react-skills/react-skills-version"
  ]
}
```

Use caret ranges for declared dependencies. Add the skill to the root README's
Available skills table. Do not add `meta.version` or a skill-local `VERSION`.

## Apply feedback

Use `evolve-skills-from-feedback` instead of turning a conversation summary
directly into source rules:

1. preserve the canonical report under
   `.agents/feedback/<target-skill>/<YYYY-MM-DD>-<topic>.md` or link the report
   when its source project cannot be published;
2. validate its metadata and required sections;
3. compare every finding with the current source skill and evidence;
4. record `accepted`, `adapted`, `already-covered`, `project-only`,
   `needs-evidence`, or `rejected` for each finding;
5. put accepted behavior in the smallest durable destination: core contract,
   focused reference, example, or deterministic validator;
6. update every affected README, example, registry entry, and test;
7. keep private code, secrets, endpoints, and customer identifiers out of the
   report and pull request.

A direct user correction is strong evidence of that user's intent. The
decision ledger still determines whether the result is a catalog-wide rule, a
conditional pattern, or a project-only convention.

## Validate

Run the feedback validator when a report is included:

```bash
node skills/evolve-skills-from-feedback/scripts/validate-feedback.mjs \
  .agents/feedback/<target-skill>/<YYYY-MM-DD>-<topic>.md
```

Run the complete repository validation for every source change:

```bash
npm run validate
```

It checks the composed catalog, unique names, complete publication files,
install targets, metadata, examples, TypeScript contracts, interactive listing,
the canonical feedback-report example, and built shadcn registry output. Also
run focused scripts, interaction tests, or forward tests appropriate to the
changed skill.

The release workflow versions the complete catalog after merge to `main`,
rebuilds the registry, and commits synchronized version metadata. Contributors
must not edit `VERSION`, `package.json` version, or `package-lock.json` version
for an ordinary pull request.

## Open the pull request

Use a focused branch and a Conventional Commit such as `feat: add table skill`,
`fix: preserve select trigger props`, or `docs: document feedback workflow`.
Complete `.github/pull_request_template.md` and include:

- the outcome and change type;
- the target skill and source version;
- the canonical feedback report or an explicit reason it is unavailable;
- a decision summary for every finding when feedback drove the change;
- confirmation that the technology and responsibility contracts were reviewed;
- commands and results for repository, feedback, type, and interaction checks;
- unresolved assumptions or intentionally deferred findings.

Keep one pull request centered on one skill or one cross-cutting repository
contract. A new skill must arrive with its README, metadata, registry item,
focused references, canonical examples, and validation in the same pull request.
