---
name: debug-from-root-cause
description: Find the mechanism behind a bug before changing code, fix it in the layer that owns the defect, and lock it with a regression test. Use when something fails, crashes, renders wrong, or behaves unexpectedly and the cause is not yet known; when a test, type check, or build fails for an unclear reason; when an earlier fix did not hold; or when the user asks to investigate a problem without fixing it.
---

Read and follow `.agents/skills/debug-from-root-cause/SKILL.md`, and the references,
examples, and companion routing it names, before starting.

Purpose: Find the mechanism, fix its owner, add a regression test.

- Inspect the repository before changing it; preserve a coherent existing
  structure and treat the bundled examples as references, never as templates.
- Keep primitives, composable families, and feature adapters in separate
  layers with dependencies pointing downward only.
- Route work the skill does not own to the companion skill it names.
- Report `React Skills v<version>` from `.agents/skills/VERSION` in the
  final handoff.
