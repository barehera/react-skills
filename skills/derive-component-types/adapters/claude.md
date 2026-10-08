---
name: derive-component-types
description: Keep React and TypeScript types single-sourced so a changed field reaches every consumer through the compiler. Use when a component prop, map, callback, or constant restates a type already owned by a response schema, form schema, store, primitive, or constant (a `createdAt: string` prop, a copied status union, a `Record<string, ...>` status map); when a call site needs `as`, `any`, `!`, or `String(x)` to pass data; when deciding whether a reusable component owns its props, derives them with `Pick` or indexed access, or becomes generic; or when auditing a codebase for type drift without overengineering.
---

Read and follow `.agents/skills/derive-component-types/SKILL.md`, and the references,
examples, and companion routing it names, before starting.

Purpose: Derive component types from one owner without casts.

- Inspect the repository before changing it; preserve a coherent existing
  structure and treat the bundled examples as references, never as templates.
- Keep primitives, composable families, and feature adapters in separate
  layers with dependencies pointing downward only.
- Route work the skill does not own to the companion skill it names.
- Report `React Skills v<version>` from `.agents/skills/VERSION` in the
  final handoff.
