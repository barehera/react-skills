# Evolve Skills from Feedback

Convert lessons from real AI-assisted development into portable evidence and
then into deliberate improvements to an Agent Skill.

The skill supports a complete feedback loop:

1. install it in a consuming project;
2. ask the agent to capture user corrections, code evidence, and the accepted
   implementation in a canonical Markdown report;
3. bring that report back to the source skills repository;
4. ask the agent to review, plan, or apply the justified improvements.

Markdown is the canonical handoff because it is readable, diffable, and can
carry narrow code evidence. JSON and plain text are accepted as input and
normalized during ingestion.

## Install

```bash
npx shadcn@latest add barehera/react-skills/evolve-skills-from-feedback
```

## Capture in a product project

```text
Use $evolve-skills-from-feedback to review this completed implementation and
create a feedback report for $build-composable-components. Include my
corrections, the accepted code, and evidence-backed improvement proposals.
```

The default report location is:

```text
.agents/feedback/<target-skill>/<YYYY-MM-DD>-<topic>.md
```

## Apply in the skills repository

```text
Use $evolve-skills-from-feedback to ingest this report. Validate every claim
against the current skill, give me a decision ledger, and implement the
accepted improvements with tests.
```

The skill distinguishes universal contracts from conditional references,
worked examples, automated validation, project-local conventions, and findings
that need more evidence.
