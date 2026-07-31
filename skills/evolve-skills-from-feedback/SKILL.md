---
name: evolve-skills-from-feedback
description: Capture concrete lessons from AI-assisted development and turn them into durable, evidence-backed skill improvements. Use when an agent must produce a skill feedback guide at the end of work in a consuming project, record user corrections or failed skill behavior, normalize a supplied Markdown, JSON, or plain-text feedback artifact, review proposed rule changes, plan updates to a source skill, or implement and validate approved skill improvements from real-world examples.
---

# Evolve Skills from Feedback

Turn project experience into portable evidence, then turn that evidence into
carefully scoped skill changes. Prefer a Markdown report with YAML frontmatter:
it is readable by people and agents, diffable, and able to preserve code and
file evidence without a separate schema tool.

## Choose the mode

- Use **capture mode** inside a consuming project after or during development.
  Produce a feedback report; do not rewrite the installed source skill.
- Use **ingest mode** when the user supplies Markdown, JSON, plain text, a diff,
  or another feedback artifact alongside an editable source skill.
- Use **round-trip mode** only when both the consuming project and source skill
  are in scope. Capture first, then ingest. Do not assume permission to edit a
  separate repository.

## Capture mode

1. Identify the target skill, its installed version or commit, and the task the
   agent attempted. Read the target `SKILL.md` and every reference needed for
   the behavior under review.
2. Gather primary evidence: user corrections, prompts, implementation diffs,
   exact code locations, screenshots, test failures, review comments, and the
   final accepted implementation. Do not reconstruct evidence from memory when
   the artifact remains available.
3. Separate observations from proposals. For each finding, record:
   - the scenario and relevant repository conventions;
   - current agent or skill behavior;
   - the user's preferred behavior and why;
   - minimal evidence with file paths or compact excerpts;
   - severity, recurrence, and confidence;
   - a proposed skill change, generalization test, and acceptance criteria.
4. Classify the finding as `missing-rule`, `ambiguous-rule`, `bad-example`,
   `missing-example`, `validation-gap`, `tool-limitation`,
   `project-convention`, or `false-positive`.
5. Write one canonical report per target skill to
   `.agents/feedback/<target-skill>/<YYYY-MM-DD>-<topic>.md`. If `.agents` is
   inappropriate for the repository, use `docs/skill-feedback/`. Follow
   [feedback-format.md](references/feedback-format.md) and copy
   [skill-feedback-template.md](assets/skill-feedback-template.md).
6. Run `node <installed-skill>/scripts/validate-feedback.mjs <report>` when
   Node.js is available. Otherwise, manually verify the same required fields.
7. Show the user the report path and a short list of the proposed improvements.
   Ask for correction only where intent remains uncertain.

## Ingest mode

1. Preserve the supplied artifact as evidence. Accept Markdown, JSON, or plain
   text, but normalize actionable findings to the canonical model before
   editing a skill. Do not require the user to rewrite their feedback.
2. Locate the current source skill and read its `SKILL.md`, routed references,
   examples, scripts, registry item, repository instructions, and validation
   workflow. Compare the report's version with the current source.
3. Verify each claim against available project evidence. Mark absent evidence
   as an assumption; do not present it as confirmed behavior.
4. Deduplicate findings against current rules and recent changes. A report may
   describe a fixed issue, a local convention, or a misunderstanding rather
   than a missing universal rule.
5. Choose the smallest durable destination:
   - core `SKILL.md` contract for frequent, high-impact behavior;
   - focused reference for detailed or conditional guidance;
   - worked example for composition or naming that is easier to show;
   - deterministic script or repository validation for mechanically testable
     invariants;
   - no source-skill change for project-only policy, tool failure, or a claim
     contradicted by evidence.
6. Read [evaluation-and-integration.md](references/evaluation-and-integration.md)
   before deciding placement or changing a source skill. Use
   [worked-example.md](references/worked-example.md) when the report concerns
   code style, component composition, or another example-driven rule.
7. Match the user's requested action:
   - for `review`, report findings and recommendations without editing;
   - for `plan`, produce ordered changes, acceptance criteria, and validation;
   - for `improve`, `fix`, or `apply`, edit the source skill, update every
     affected example and registry entry, and run the repository validations.
8. Report a decision for every finding: `accepted`, `adapted`, `already-covered`,
   `project-only`, `needs-evidence`, or `rejected`, with a short reason.

## Evidence rules

- Treat direct user feedback as authoritative design intent for that user, but
  still test whether the proposed rule should generalize across repositories.
- Cite exact paths and narrow excerpts. Include only enough proprietary code to
  demonstrate the issue, and redact secrets, personal data, endpoints, and
  customer identifiers.
- Keep one behavioral claim per finding. Split findings that need different
  destinations or acceptance tests.
- Preserve counterexamples and tradeoffs. Do not turn a preference into
  `always` or `never` unless its scope is explicit and supported.
- Prefer a rule that states ownership and decision criteria over a copied fix
  for one component.
- Record the final accepted implementation when it differs from the first user
  suggestion; the accepted result is stronger evidence than an intermediate
  correction.

## Completion contract

For capture mode, deliver a validated feedback report that another agent can
understand without the original conversation. For ingest mode, deliver a
finding-by-finding decision ledger plus either a plan or validated source-skill
changes. Keep unresolved product choices explicit instead of silently choosing
them.
