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

Each skill is independently documented, installable, and versioned through this repository. Skills teach an agent how to inspect and adapt a project; they do not force a starter template or install application runtime dependencies.

## Available skills

| Skill | Purpose |
| --- | --- |
| [Manage Server State](skills/manage-server-state/README.md) | Build, extend, refactor, and audit type-safe React server state around real backend contracts. |

More skills can be added without changing the installation workflow.

## Choose and install

Run the interactive installer from your project root:

```bash
npx --yes github:barehera/react-skills
```

It reads the catalog, shows every available skill, and lets you select one or more. shadcn performs the installation after your selection.

To install a known skill directly:

```bash
npx shadcn@latest add barehera/react-skills/manage-server-state
```

To inspect the catalog without installing:

```bash
npx --yes github:barehera/react-skills --list
```

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
