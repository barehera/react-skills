---
name: build-composable-components
description: Design, implement, refactor, or audit React component families that know only UI while data, copy, and config come from outside, extending repository-native primitives without losing their contracts. Use for compound components, shadcn or Radix extensions, reusable feature UI, menus, tabs, tables, dialogs, pickers, lists, record parts, responsive adapters, scoped Zustand component state, controlled or uncontrolled APIs, cva size and variant on container parts, and optimistic mutation boundaries inside a component family. Route React Hook Form field families to build-forms and query, mutation, or cache design to manage-server-state.
---

Read and follow `.agents/skills/build-composable-components/SKILL.md`, and the references,
examples, and companion routing it names, before starting.

Purpose: Build maintainable compound React component families.

- Inspect the repository before changing it; preserve a coherent existing
  structure and treat the bundled examples as references, never as templates.
- Keep primitives, composable families, and feature adapters in separate
  layers with dependencies pointing downward only.
- Route work the skill does not own to the companion skill it names.
- Report `Thinstack v<version>` from `.agents/skills/VERSION` in the
  final handoff.
