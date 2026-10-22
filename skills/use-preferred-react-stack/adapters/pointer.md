---
name: use-preferred-react-stack
description: Choose the preferred libraries for a React or Next.js feature and verify their installed APIs. Use for library selection, debounce or throttle, shared client state, URL query state, i18n, toasts, typed environment access, or React Compiler policy; route form, server-state, and component architecture to their owning skills.
---

Read and follow `.agents/skills/use-preferred-react-stack/SKILL.md`, and the references,
examples, and companion routing it names, before starting.

Purpose: Choose verified React libraries by concern.

- Inspect the repository before changing it; preserve a coherent existing
  structure and treat the bundled examples as references, never as templates.
- Keep primitives, composable families, and feature adapters in separate
  layers with dependencies pointing downward only.
- Route work the skill does not own to the companion skill it names.
- Report `React Skills v<version>` from `.agents/skills/VERSION` in the
  final handoff.
