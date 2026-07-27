# Adding a skill

Each skill is a self-contained registry item. Keep skill-specific decisions inside its folder and keep the root catalog generic.

## Structure

```text
skills/
  skill-name/
    SKILL.md
    VERSION
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

- `SKILL.md` contains concise agent instructions and links directly to focused references.
- `VERSION` contains the React Skills release that last synchronized the catalog. Do not edit it manually.
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

Paths inside the skill registry are relative to that skill's folder. Publish every skill resource that the agent needs, but do not publish its human-facing `README.md` or local `registry.json`.

Add the skill to the **Available skills** table in the root README.

Set `meta.version` and `VERSION` by running:

```bash
npm run release:sync-version
```

Without an explicit argument, the command uses the latest repository `v*` tag.
The release workflow reruns it with semantic-release's next version and commits
the synchronized skill metadata automatically. Skills use the catalog release
version; they are not versioned independently.

## Validate

Run:

```bash
npm run validate
```

Validation checks the composed catalog, unique names, complete skill files, install targets, metadata, examples, interactive catalog listing, TypeScript examples, and built registry output.

The release workflow versions the complete React Skills catalog after changes
merge to `main`, rebuilds the registry, and commits the generated version
metadata with a skipped-CI release commit.
