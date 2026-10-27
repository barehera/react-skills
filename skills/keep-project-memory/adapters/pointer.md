---
name: keep-project-memory
description: Keep a small Markdown memory of a project in `.agents/memory/` so the next session starts from what earlier sessions learned. Use at the start of work in a repository that has `.agents/memory/MEMORY.md`; when the user says remember, note, forget, or "we already decided"; when the user corrects how the agent works in this project; or when a decision, gotcha, or constraint comes up that the code and git history do not record.
---

Read and follow `.agents/skills/keep-project-memory/SKILL.md`, and the references,
examples, and companion routing it names, before starting.

Purpose: Remember project decisions and gotchas in Markdown.

- Inspect the repository before changing it; preserve a coherent existing
  structure and treat the bundled examples as references, never as templates.
- Keep primitives, composable families, and feature adapters in separate
  layers with dependencies pointing downward only.
- Route work the skill does not own to the companion skill it names.
- Report `React Skills v<version>` from `.agents/skills/VERSION` in the
  final handoff.
