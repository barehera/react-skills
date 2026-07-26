# Adding a skill

Each skill is a self-contained registry item. Keep skill-specific decisions inside its folder and keep the root catalog generic.

## Structure

```text
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

- `SKILL.md` contains concise agent instructions and links directly to focused references.
- `README.md` is human-facing documentation linked from the root catalog.
- `registry.json` declares one installable item named exactly like the folder.
- `agents/openai.yaml` contains UI metadata for agents that support it.
- `references`, `examples`, `scripts`, and `assets` contain reusable skill resources.
- `adapters` contains thin tool-specific entry points when native skill discovery is unavailable.

## Add the catalog entry

Add the skill registry to the root `registry.json`:

```json
{
  "include": [
    "skills/manage-react-server-state/registry.json",
    "skills/skill-name/registry.json"
  ]
}
```

Paths inside the skill registry are relative to that skill's folder. Publish every skill resource that the agent needs, but do not publish its human-facing `README.md` or local `registry.json`.

Add the skill to the **Available skills** table in the root README.

## Validate

Run:

```bash
npm run validate
```

Validation checks the composed catalog, unique names, complete skill files, install targets, metadata, examples, interactive catalog listing, TypeScript examples, and built registry output.

The release workflow versions the complete React Skills catalog after changes merge to `main`.
