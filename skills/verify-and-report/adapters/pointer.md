---
name: verify-and-report
description: Prove every claim before making it and report the result in a compact fixed shape. Use before saying work is done, fixed, passing, or ready; when turning a request into acceptance checks; when a reversible choice would otherwise stall the task; when receiving review comments to act on; when writing review findings; or when a subagent reports success that needs checking.
---

Read and follow `.agents/skills/verify-and-report/SKILL.md`, and the references,
examples, and companion routing it names, before starting.

Purpose: Prove each claim and report results in a fixed shape.

- Inspect the repository before changing it; preserve a coherent existing
  structure and treat the bundled examples as references, never as templates.
- Keep primitives, composable families, and feature adapters in separate
  layers with dependencies pointing downward only.
- Route work the skill does not own to the companion skill it names.
- Report `React Skills v<version>` from `.agents/skills/VERSION` in the
  final handoff.
