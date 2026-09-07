# React Skills technology contract

## Contents

- [Purpose](#purpose)
- [Preferred stack](#preferred-stack)
- [Responsibility boundaries](#responsibility-boundaries)
- [Skill boundaries](#skill-boundaries)
- [Canonical example rules](#canonical-example-rules)
- [Changing the stack](#changing-the-stack)

## Purpose

React Skills is an opinionated skeleton for the React ecosystem, not a
framework-neutral skill collection. New source skills, references, and
canonical examples must reinforce the same technology choices and architecture
language so skills can be composed without teaching conflicting patterns.

Installed skills still inspect a consuming repository before editing it. They
should preserve a coherent existing application instead of replacing its stack
without permission. That repository-awareness is an integration rule, not an
invitation to make canonical React Skills examples technology-agnostic.

## Preferred stack

| Concern | Preferred technology | Repository contract |
| --- | --- | --- |
| UI runtime | React with TypeScript | Use typed function components and current React APIs. |
| UI primitives | shadcn/ui and Radix | Extend existing primitives and preserve their props, refs, accessibility, focus, and composition contracts. |
| Component API | Compound components | Give each visible part its natural primitive props; roots own only shared bindings and state. |
| Styling | Tailwind CSS with the repository `cn` convention | Preserve primitive classes, variants, named groups, and consumer `className` overrides. |
| Form state | React Hook Form | Own submitted values, validation lifecycle, field registration, errors, reset, and submission. |
| Runtime validation | Zod | Define schemas at trust boundaries and infer TypeScript values when the schema is authoritative. |
| Shared client state | Zustand vanilla stores | Create one scoped store per root and subscribe through narrow selectors; never share one module-global store across repeated component instances. |
| Remote state | TanStack Query | Own queries, mutations, request status, retries, invalidation, and cache synchronization. |
| HTTP transport | Axios through a project transport wrapper | Keep authentication, cancellation, normalization, and transport errors below feature query code. |
| Query identity | TanStack Query keys and Query Key Factory where useful | Centralize stable query identity and use targeted cache effects. |
| Registry and installation | shadcn registry | Publish every agent resource through a skill-local registry item and the root catalog. |

Use the smallest applicable part of the stack. A presentational component does
not need Zustand, a local synchronous form does not need TanStack Query, and a
query without a runtime trust-boundary requirement does not need a duplicate
Zod model. Do not substitute a different library in a canonical example merely
to demonstrate extensibility.

## Responsibility boundaries

Keep one owner for each kind of state and behavior:

- shadcn/Radix owns primitive interaction, focus, keyboard behavior, portals,
  and base styling;
- a compound component root owns only state and bindings shared by its slots;
- React Hook Form owns submitted form values and field validation state;
- a Stepper owns step order, active step, and navigation independently from a
  Form;
- scoped Zustand owns reactive client-only properties or actions shared by many
  descendants when ordinary props or stable React context are insufficient;
- TanStack Query owns remote records and mutation/cache lifecycle;
- Axios owns HTTP transport details;
- Zod owns runtime parsing at explicit trust boundaries;
- feature composition connects these owners without merging their public APIs.

Do not create fused `StepperForm`, `CardForm`, query-aware visual primitives, or
global Zustand stores that blur these boundaries. Add a focused feature adapter
when two independent APIs need coordination.

## Skill boundaries

Use and extend the existing skill that owns the concern:

| Concern | Owning skill |
| --- | --- |
| shadcn extensions, compound slots, variants, scoped component state | `build-composable-components` |
| React Hook Form, Zod form schemas, field families, browser form UX | `build-forms` |
| Axios contracts, TanStack Query, mutations, query keys, cache effects | `manage-server-state` |
| evidence capture, finding evaluation, and durable skill improvements | `evolve-skills-from-feedback` |

A new skill may compose these capabilities, but it must route to the owning
skill rather than copying its complete rules. Recommend an uninstalled
companion once, explain the concrete benefit, and require approval before
installation.

## Canonical example rules

Every new or substantially changed skill must include a realistic example when
structure, naming, or composition is central to the workflow. Canonical
examples must:

1. use the preferred stack for every concern they include;
2. use a domain model different from user-provided private examples;
3. keep feature-specific schemas, types, constants, and policies cohesive;
4. use shadcn primitives instead of restyled raw controls when a primitive
   exists, while retaining semantic HTML such as `form`, `section`, and
   headings;
5. keep compound parts independently configurable with slot-owned props;
6. keep remote, form, workflow, and scoped client state in their owning layer;
7. use direct imports and avoid re-export-only barrels;
8. preserve type inference through the public API;
9. compile against the real package APIs when the repository type-check harness
   covers the example;
10. document companion-skill routing instead of silently expanding scope.

Prefer one complete, tested composition over several incomplete alternatives.
References may explain adaptation points, but the canonical implementation
must remain decisive and internally consistent.

## Changing the stack

Treat a preferred-library change as a repository architecture decision, not a
local example preference. A proposal must include:

- a validated feedback report or equivalent evidence;
- the affected skills and responsibility boundaries;
- a migration impact assessment for examples and installed guidance;
- a decision on whether the old technology remains supported;
- updates to this document, repository instructions, affected skills, tests,
  and pull-request guidance.

Do not add interchangeable branches such as “Axios or any client” or “React
Hook Form or any form library” to new canonical examples. A consuming project
may require an adapter, but the React Skills source remains centered on this
stack until an explicit repository decision changes it.
