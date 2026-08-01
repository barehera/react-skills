<div align="center">
  <h1>React Skills</h1>
  <p><strong>A growing catalog of maintainable Agent Skills for React development.</strong></p>

  <p>
    <a href="https://agentskills.io"><img alt="Agent Skills" src="https://img.shields.io/badge/Agent_Skills-open_standard-7C3AED?style=for-the-badge"></a>
    <a href="https://ui.shadcn.com/docs/registry"><img alt="shadcn Registry" src="https://img.shields.io/badge/shadcn-registry-111827?style=for-the-badge&logo=shadcnui&logoColor=white"></a>
    <a href="https://react.dev"><img alt="React" src="https://img.shields.io/badge/React-development-149ECA?style=for-the-badge&logo=react&logoColor=white"></a>
  </p>
</div>

## What is this?

React Skills gives repository-aware AI coding agents focused workflows for building clean, consistent React applications.

Each skill is independently documented and installable, while the catalog is
released as one versioned unit. The GitHub `v*` release is canonical; root
`VERSION`, package metadata, the selector, and installed skills are synchronized
copies of that release number.

The catalog is intentionally opinionated. Its canonical skeleton uses React,
TypeScript, shadcn/Radix primitives, compound components, React Hook Form, Zod,
scoped Zustand stores, TanStack Query, Axios, and focused feature ownership.
Skills inspect a consuming repository before changing it, but source skills and
examples do not become framework-neutral menus of interchangeable packages.
See the [technology contract](docs/technology-stack.md) for the shared stack and
responsibility boundaries.

## Available skills

| Skill | Purpose |
| --- | --- |
| [Build Forms](skills/build-forms/README.md) | Build composable, accessible React forms with slot-owned props, typed feature hooks, and independent workflow orchestration. |
| [Manage Server State](skills/manage-server-state/README.md) | Build, extend, refactor, and audit type-safe React server state around real backend contracts. |
| [Build Composable Components](skills/build-composable-components/README.md) | Design and refactor component families with preserved base contracts, slot-owned props, scoped state, and correct async boundaries. |
| [Evolve Skills from Feedback](skills/evolve-skills-from-feedback/README.md) | Capture evidence from real projects and turn it into validated, durable skill improvements. |

More skills can be added without changing the installation workflow.

The composable-component skill covers the cases that usually break down as a
design system grows: extending shadcn and Radix contracts, root-owned size and
variant propagation, render-callback collections with consumer-owned item
anatomy, controlled optional values, per-root Zustand stores, persistent
overlays, and optimistic server-state boundaries. Its worked examples progress
from ordinary props to advanced and expert compound families.

## Choose and install

Run the interactive installer from your project root:

```bash
npx --yes github:barehera/react-skills
```

The selector uses the same terminal interaction style as shadcn:

- `↑` / `↓` moves between skills.
- `Space` selects or clears a skill.
- `a` toggles all skills.
- `Enter` installs the selection.

Press `Ctrl+C` to cancel. shadcn performs the installation after your
selection.

To install a known skill directly:

```bash
npx shadcn@latest add barehera/react-skills/manage-server-state
npx shadcn@latest add barehera/react-skills/build-forms
npx shadcn@latest add barehera/react-skills/build-composable-components
npx shadcn@latest add barehera/react-skills/evolve-skills-from-feedback
```

To inspect the catalog without installing:

```bash
npx --yes github:barehera/react-skills --list
```

The catalog displays the one React Skills release version. Installing any skill
also installs `.agents/skills/VERSION`, so agents can report which repository
release supplied every installed React Skills workflow.

Review a skill before applying it:

```bash
npx shadcn@latest view barehera/react-skills/manage-server-state
npx shadcn@latest add barehera/react-skills/manage-server-state --dry-run
```

## Use an installed skill

Name the skill in your request:

```text
Use $manage-server-state to add the Products server state.
Inspect this repository and its API documentation before writing code.
```

```text
Use $build-forms to create a multi-step onboarding form with composable shadcn
field slots. Keep Form and Stepper independent, and recommend the server-state
skill if the submission requires API and cache work.
```

```text
Use $build-composable-components to refactor this task action family.
Preserve its shadcn contracts, inherit size from the root, keep optional
overlays explicit, and expose collection item anatomy through render callbacks.
```

```text
Use $evolve-skills-from-feedback to review this completed implementation and
create an evidence-backed feedback report for the skill we used. I will bring
that report back to the skills repository for planning or implementation.
```

If your agent does not discover skills automatically:

```text
Read .agents/skills/manage-server-state/SKILL.md completely and follow it
for this task.
```

## Contribute through feedback

Use the feedback skill to turn a real product-project correction into a reviewable
React Skills pull request.

1. Install both the skill being tested and the feedback skill in the product
   repository:

   ```bash
   npx shadcn@latest add barehera/react-skills/build-forms
   npx shadcn@latest add barehera/react-skills/evolve-skills-from-feedback
   ```

2. Complete a real task with the target skill. Keep the accepted implementation,
   user corrections, relevant diff, and test output available.
3. Ask the agent to capture the evidence:

   ```text
   Use $evolve-skills-from-feedback in capture mode for $build-forms.
   Record my corrections, the accepted implementation, exact file evidence,
   generalization boundaries, and observable acceptance criteria.
   ```

4. Review the report at
   `.agents/feedback/<target-skill>/<YYYY-MM-DD>-<topic>.md`. It must follow the
   [feedback format](skills/evolve-skills-from-feedback/references/feedback-format.md)
   and start from the
   [report template](skills/evolve-skills-from-feedback/assets/skill-feedback-template.md).
5. Validate it in the product repository:

   ```bash
   node .agents/skills/evolve-skills-from-feedback/scripts/validate-feedback.mjs \
     .agents/feedback/<target-skill>/<YYYY-MM-DD>-<topic>.md
   ```

6. Open a focused branch in this repository, preserve the report as evidence or
   link it when the source cannot be published, and ask the agent to ingest it:

   ```text
   Use $evolve-skills-from-feedback in ingest mode for this report.
   Compare every finding with the current source skill, produce a decision
   ledger, implement accepted changes, and run the repository validation.
   ```

7. Run `npm run validate`, then open the pull request using the repository
   template. Include the target skill/version, report path, finding decisions,
   stack alignment, validation results, and unresolved assumptions.

Feedback-only pull requests are welcome when the evidence is ready but the
source change is not. Redact secrets, private endpoints, customer identifiers,
and unnecessary proprietary code. See
[Adding or improving a skill](docs/adding-a-skill.md) for the full authoring and
pull-request workflow.

## Update

Open the selector again or update one skill directly:

```bash
npx --yes github:barehera/react-skills --overwrite
npx shadcn@latest add barehera/react-skills/manage-server-state --overwrite
```

## Repository organization

Every skill owns its instructions, references, examples, adapters, documentation, and registry item under `skills/<skill-name>`. The root registry composes those independent items into one catalog.

See [Adding or improving a skill](docs/adding-a-skill.md) for the required
structure, preferred stack, feedback loop, and validation workflow.
