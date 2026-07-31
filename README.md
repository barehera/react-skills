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
copies of that release number. Skills teach an agent how to inspect and adapt a
project; they do not force a starter template or install application runtime
dependencies.

## Available skills

| Skill | Purpose |
| --- | --- |
| [Manage Server State](skills/manage-server-state/README.md) | Build, extend, refactor, and audit type-safe React server state around real backend contracts. |
| [Build Composable Components](skills/build-composable-components/README.md) | Design and refactor component families with preserved base contracts, inherited variants, scoped state, and correct async boundaries. |
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

## Update

Open the selector again or update one skill directly:

```bash
npx --yes github:barehera/react-skills --overwrite
npx shadcn@latest add barehera/react-skills/manage-server-state --overwrite
```

## Repository organization

Every skill owns its instructions, references, examples, adapters, documentation, and registry item under `skills/<skill-name>`. The root registry composes those independent items into one catalog.

See [Adding a skill](docs/adding-a-skill.md) for the required structure and validation workflow.
