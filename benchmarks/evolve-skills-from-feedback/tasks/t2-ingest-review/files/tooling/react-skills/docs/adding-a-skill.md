# Adding or changing a skill

## Skill quality contract

- `SKILL.md` contains `## Version`, `## Layer placement`, and
  `## Companion skill routing`, and stays under 220 lines.
- Every rule names the layer it governs.
- TypeScript examples live in `examples/` and must pass `npm run typecheck`
  from the app root (the root `tsconfig.json` includes them).
- `registry.json` lists every file in the skill folder except `README.md` and
  `registry.json` itself.
- `README.md` describes what the skill teaches for humans; update it when a
  change alters that description.
- Adapters are generated at release time; do not hand-edit them.

## Applying feedback

Keep each incoming report as evidence; never delete it. Record a decision for
every finding. Change the smallest file that fixes the behavior and state each
rule in one place.
