---
name: evolve-skills-from-feedback
description: Capture concrete lessons from AI-assisted development and turn them into durable, evidence-backed skill improvements. Use when an agent must produce a skill feedback guide at the end of work in a consuming project, record user corrections or failed skill behavior, normalize a supplied Markdown, JSON, or plain-text feedback artifact, or review, plan, or apply source-skill improvements from real-world examples.
---

# Evolve Skills from Feedback

Turn project experience into portable evidence, then turn that evidence into
carefully scoped skill changes.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff
and in every feedback report's frontmatter.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns no application layer. When a finding proposes a rule, state
which layer the rule governs and confirm the proposal keeps dependencies
pointing downward. A finding that would make a family read a query or a
primitive learn a product rule is a boundary violation, not a missing rule.

## Required workflow

Choose the mode:

- **Capture** in a consuming project: write a feedback report; do not rewrite
  the installed source skill.
- **Ingest** when the user supplies a feedback artifact (Markdown, JSON, plain
  text, a diff) alongside an editable source skill.
- **Round-trip** only when both are in scope: capture, then ingest. Do not
  assume permission to edit a separate repository.

### Capture mode

Write for the agent who will improve the target skill. Originating product code
is evidence, not the destination: `Preferred behavior`, `Proposed skill change`,
reusable examples, and `Acceptance criteria` describe a skill rule, reference,
example, or validator. Only a finding classified as `project-convention` may
recommend a consuming-repo change.

1. Identify the target skill, its installed version or commit, and the task the
   agent attempted. Read the target `SKILL.md` and the references behind the
   behavior under review.
2. Gather primary evidence: user corrections, prompts, diffs, exact code
   locations, screenshots, test failures, review comments, and the final
   accepted implementation. Do not reconstruct evidence from memory when the
   artifact remains available.
3. Read [worked-example.md](references/worked-example.md), then convert each
   observation into an ownership or decision rule with a boundary, a portable
   example, its skill destination, and a fresh-task test. Prefer the target
   skill's vocabulary; otherwise use a short generic name rather than an
   originating feature name.
4. Keep observations (scenario and repository conventions, evidence, current
   behavior) separate from proposals (the user's preferred behavior and why,
   proposed skill change, generalization test, acceptance criteria).
5. Classify the finding as `missing-rule`, `ambiguous-rule`, `bad-example`,
   `missing-example`, `validation-gap`, `tool-limitation`,
   `project-convention`, or `false-positive`.
6. Apply the deletion gate: if the originating feature disappeared, would each
   reusable finding's proposal sections, examples, and fresh-task test still
   teach the right behavior? If not, rewrite them or classify the finding as
   `project-convention`. Do not remove narrow origin evidence.
7. Write one report per target skill to
   `.agents/feedback/<target-skill>/<YYYY-MM-DD>-<topic>.md`. If `.agents` is
   inappropriate for the repository, use `docs/skill-feedback/`. Copy
   [skill-feedback-template.md](assets/skill-feedback-template.md);
   [feedback-format.md](references/feedback-format.md) defines its fields.
8. Run `node <installed-skill>/scripts/validate-feedback.mjs <report>` when
   Node.js is available; otherwise check the same required fields by hand.
9. Show the user the report path and a short list of the proposed improvements.
   Ask for correction only where intent remains uncertain.

### Ingest mode

1. Preserve the supplied artifact as evidence. Normalize its actionable
   findings to the [report model](references/feedback-format.md) before
   editing a skill; do not require the user to rewrite their feedback.
2. Read the source skill (`SKILL.md`, routed references, examples, scripts,
   registry item), the repository instructions and validation workflow, and
   its skill-authoring and technology guides (in React Skills,
   `docs/technology-stack.md` and `docs/adding-a-skill.md`) before evaluating a
   finding or creating a skill. Compare the report's version with the current
   source.
3. Verify each claim against available evidence. Mark absent evidence as an
   assumption, not confirmed behavior.
4. Deduplicate findings against current rules and recent changes. A report may
   describe a fixed issue, a local convention, or a misunderstanding rather
   than a missing universal rule.
5. Read [evaluation-and-integration.md](references/evaluation-and-integration.md)
   before deciding placement or changing a source skill, and put each accepted
   finding in the smallest durable destination it lists. Use
   [worked-example.md](references/worked-example.md) when the report concerns
   code style, component composition, or another example-driven rule.
6. Match the user's requested action:
   - `review`: report findings and recommendations without editing;
   - `plan`: ordered changes, acceptance criteria, and validation;
   - `improve`, `fix`, or `apply`: edit the source skill, update every affected
     example and registry entry, and run the repository validations.
7. Report a decision for every finding: `accepted`, `adapted`,
   `already-covered`, `project-only`, `needs-evidence`, or `rejected`, with a
   short reason. Keep unresolved product choices explicit instead of silently
   choosing them.

## Evidence rules

- Treat direct user feedback as authoritative design intent for that user, but
  still test whether the proposed rule should generalize across repositories.
- Cite exact paths and narrow excerpts. Include only enough proprietary code to
  demonstrate the issue, and redact secrets, personal data, endpoints, and
  customer identifiers.
- Keep origin excerpts, project paths, and export names under `Evidence`. If
  origin and reusable snippets must appear together, label them
  `origin (do not ingest)` and `skill example (ingest this)`.
- Keep one behavioral claim per finding. Split findings that need different
  destinations or acceptance tests.
- Preserve counterexamples and tradeoffs. Do not turn a preference into
  `always` or `never` unless its scope is explicit and supported.
- Record the final accepted implementation when it differs from the first user
  suggestion, because it is stronger evidence than an intermediate correction.

## Companion skill routing

- Route the behavior under review to its owning skill:
  `$build-composable-components` for families and primitive extensions,
  `$build-forms` for field families and typed forms, `$manage-server-state`
  for transport, queries, mutations, and cache effects, and
  `$document-business-logic` for comment decisions.
- In ingest mode, apply the source repository's skill quality contract in
  `docs/adding-a-skill.md` to every accepted change: layer placement, version
  handoff, companion routing, a type-checked example, the complete adapter set,
  and validation.
- If a useful companion is not installed, explain its concrete benefit once
  and ask before installing it. Continue without it if the user declines.
