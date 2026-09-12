---
trigger: glob
globs: "**/.agents/feedback/**/*.md, **/skills/**/SKILL.md"
---

Read and follow `.agents/skills/evolve-skills-from-feedback/SKILL.md`, and the references,
examples, and companion routing it names, before starting.

Purpose: Turn project evidence into durable skill improvements.

- Inspect the repository before changing it; preserve a coherent existing
  structure and treat the bundled examples as references, never as templates.
- Keep primitives, composable families, and feature adapters in separate
  layers with dependencies pointing downward only.
- Route work the skill does not own to the companion skill it names.
- Report `React Skills v<version>` from `.agents/skills/VERSION` in the
  final handoff.
