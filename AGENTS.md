# React Skills repository instructions

Before creating or changing a skill:

1. Read [docs/technology-stack.md](docs/technology-stack.md).
2. Read [docs/adding-a-skill.md](docs/adding-a-skill.md).
3. Read the target skill's `SKILL.md`, routed references, complete examples,
   registry item, and human-facing README.
4. When the change comes from product-project experience, read and use
   `skills/evolve-skills-from-feedback/SKILL.md`; preserve the validated report
   as evidence and record a decision for every finding.

This catalog is an opinionated React and TypeScript skeleton. Canonical skills
and examples use shadcn/Radix primitives, compound component APIs, React Hook
Form, Zod, scoped Zustand stores, TanStack Query, Axios, and the repository's
documented companion-skill boundaries. Do not make new source skills
framework-neutral or add interchangeable technology branches without an
approved change to the stack guide.

Keep Form, Stepper, server state, local Zustand state, transport, and visual
component responsibilities separate. Reuse existing skills through explicit
companion routing instead of duplicating their rules in a new skill.

Run `npm run validate` before handoff. For feedback reports, also run
`node skills/evolve-skills-from-feedback/scripts/validate-feedback.mjs <report>`.
