---
name: map-project-modules
description: Keep a one-page Markdown map of a project's modules, entry points, and most-imported files in `.agents/map/MODULE_MAP.md`, and use it to find code with a targeted search instead of broad reading. Use at the start of work in a repository that has the map; when orienting in an unfamiliar or large codebase; when asked where something lives or how modules connect; or when the map's commit is older than changes to the modules it lists.
---

Read and follow `.agents/skills/map-project-modules/SKILL.md`, and the references,
examples, and companion routing it names, before starting.

Purpose: Keep a one-page Markdown map of modules and hub files.

- Inspect the repository before changing it; preserve a coherent existing
  structure and treat the bundled examples as references, never as templates.
- Keep primitives, composable families, and feature adapters in separate
  layers with dependencies pointing downward only.
- Route work the skill does not own to the companion skill it names.
- Report `React Skills v<version>` from `.agents/skills/VERSION` in the
  final handoff.
