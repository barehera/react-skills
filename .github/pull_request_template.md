## Outcome

<!-- Describe the user-visible skill behavior or contributor outcome. -->

## Change type

- [ ] New skill
- [ ] Existing skill improvement
- [ ] Feedback report only
- [ ] Repository tooling or documentation

## Skill and evidence

- Target skill: <!-- canonical skill name, or n/a -->
- Target version/commit: <!-- VERSION or source commit -->
- Feedback report: <!-- .agents/feedback/<skill>/<date>-<topic>.md, linked report, or n/a -->
- Finding decisions: <!-- accepted/adapted/already-covered/project-only/needs-evidence/rejected, or n/a -->

## Architecture alignment

- [ ] I read `docs/technology-stack.md` and `docs/adding-a-skill.md`.
- [ ] Canonical examples use the repository's preferred React stack for every
      concern they include.
- [ ] Form, Stepper, scoped Zustand state, server state, transport, and visual
      component responsibilities remain separate.
- [ ] Existing owning skills are reused or referenced instead of duplicated.
- [ ] Skill resources, registry files, READMEs, and examples remain in sync.

## Skill quality contract

- [ ] `SKILL.md` has `Version`, `Layer placement`, and `Companion skill
      routing` sections, a workflow or mode section, and stays under 220 lines.
- [ ] Every rule and example names the layer it governs: primitive,
      composable family, or feature adapter.
- [ ] Shipped TypeScript examples are covered by `tsconfig.examples.json`.
- [ ] `npm run skills:sync` was run so adapters and registry files match.

## Validation

- [ ] `npm run validate`
- [ ] `node skills/evolve-skills-from-feedback/scripts/validate-feedback.mjs <report>` when a report is included
- [ ] Relevant typecheck, interaction, or forward test: <!-- command/result or n/a -->

## Notes

<!-- Record assumptions, rejected alternatives, screenshots, or follow-up work. -->
