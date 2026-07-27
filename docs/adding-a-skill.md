# Adding a skill

Each skill is a self-contained registry item. Keep skill-specific decisions inside its folder and keep the root catalog generic.

## Structure

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

- Root `VERSION` is the generated machine-readable copy of the canonical GitHub
  release version. Do not edit it manually.
- `SKILL.md` contains concise agent instructions and links directly to focused references.
- `README.md` is human-facing documentation linked from the root catalog.
- `registry.json` declares one installable item named exactly like the folder.
- `agents/openai.yaml` contains UI metadata for agents that support it.
- `references`, `examples`, `scripts`, and `assets` contain reusable skill resources.
- `adapters` contains thin tool-specific entry points when native skill discovery is unavailable.

## Name the skill

Use a short, lowercase, verb-led name that describes the action:

- Prefer `manage-server-state`, `audit-accessibility`, or `build-forms`.
- Do not add `react` only as a namespace; the repository already provides that context.
- Include `react` only when React itself is the subject of the workflow, such as `upgrade-react`.
- Keep the folder name, `SKILL.md` frontmatter, registry item name, install path, and invocation name identical.

## Add the catalog entry

Add the skill registry to the root `registry.json`:

```json
{
  "include": [
    "skills/manage-server-state/registry.json",
    "skills/skill-name/registry.json"
  ]
}
```

Paths inside the skill registry are relative to that skill's folder. Publish
every skill resource that the agent needs, but do not publish its human-facing
`README.md` or local `registry.json`. Every skill must depend on the internal
catalog item that installs the shared release version:

```json
{
  "registryDependencies": [
    "barehera/react-skills/react-skills-version"
  ]
}
```

Add the skill to the **Available skills** table in the root README.

Do not add `meta.version` or a skill-local `VERSION`. The selector reads the
shared release version for every skill, and the internal dependency installs it
once at `.agents/skills/VERSION`. Semantic-release determines the next GitHub
release version, then synchronizes root `VERSION`, `package.json`, and
`package-lock.json` before publishing and commits those generated copies
automatically.

## Validate

Run:

```bash
npm run validate
```

Validation checks the composed catalog, unique names, complete skill files, install targets, metadata, examples, interactive catalog listing, TypeScript examples, and built registry output.

The release workflow versions the complete React Skills catalog after changes
merge to `main`, rebuilds the registry, and commits the generated version
metadata with a skipped-CI release commit.
