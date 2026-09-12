---
trigger: glob
globs: "**/components/**/*.{ts,tsx}"
---

Read and follow `.agents/skills/build-composable-components/SKILL.md`, and the references,
examples, and companion routing it names, before starting.

Purpose: Build maintainable compound React component families.

- Inspect the repository before changing it; preserve a coherent existing
  structure and treat the bundled examples as references, never as templates.
- Keep primitives, composable families, and feature adapters in separate
  layers with dependencies pointing downward only.
- Route work the skill does not own to the companion skill it names.
- Report `React Skills v<version>` from `.agents/skills/VERSION` in the
  final handoff.
