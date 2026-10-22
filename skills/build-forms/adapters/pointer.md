---
name: build-forms
description: Design, implement, refactor, or audit accessible, browser-friendly React form systems. Reuses the repository's incumbent typed form factory and field adapters, or builds a fresh one on shadcn or Radix primitives, React Hook Form, and Zod. Use for compact field adapters with typed slot props over compound field slots, typed feature forms, input/select/textarea/radio/checkbox/date adapters, autofill and mobile input UX, dynamic field arrays, conditional fields, multi-step forms, submission workflows, error focus, auditing forms that bypass the typed root, and separating form state from steppers or other navigation.
---

Read and follow `.agents/skills/build-forms/SKILL.md`, and the references,
examples, and companion routing it names, before starting.

Purpose: Build accessible React forms on a typed form factory.

- Inspect the repository before changing it; preserve a coherent existing
  structure and treat the bundled examples as references, never as templates.
- Keep primitives, composable families, and feature adapters in separate
  layers with dependencies pointing downward only.
- Route work the skill does not own to the companion skill it names.
- Report `React Skills v<version>` from `.agents/skills/VERSION` in the
  final handoff.
