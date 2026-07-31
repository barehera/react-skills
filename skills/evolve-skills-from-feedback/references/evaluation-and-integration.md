# Evaluate and integrate feedback

Use this reference in ingest mode before planning or editing a source skill.

## Evaluate each finding

Score the finding qualitatively across five dimensions:

| Dimension | Strong evidence | Weak evidence |
| --- | --- | --- |
| Reproduction | exact prompt, code, or test | remembered impression |
| Generality | applies across repositories | one local convention |
| Impact | correctness, API, accessibility, maintainability | cosmetic preference |
| Recurrence | repeated or structurally likely | isolated accident |
| Verifiability | observable acceptance test | subjective outcome only |

A weak dimension does not automatically reject a finding. It changes placement:
a conditional reference or example may be safer than a non-negotiable rule.

## Choose the destination

| Outcome | Put it in | Typical signal |
| --- | --- | --- |
| Core contract | `SKILL.md` | frequent, high-impact, broadly applicable |
| Conditional guidance | focused reference | context changes the answer |
| Worked composition | example | structure is clearer in code than prose |
| Automated guardrail | script or repository validation | invariant is deterministic |
| Project policy | consuming repository instructions | preference is not universal |
| No change | decision ledger only | fixed, unsupported, or contradicted |

Avoid duplicating the same instruction in several files. Keep the brief
contract in `SKILL.md` only when it must always be loaded, and route detailed
guidance directly to one reference.

## Integrate safely

1. Rebase the report against the current skill version.
2. Write the smallest rule that explains the accepted behavior and its scope.
3. Update or add one realistic example that would have prevented the failure.
4. Add deterministic validation only when it can detect the defect without
   encoding one repository's formatting.
5. Review adjacent rules for contradiction, duplication, or inflated context.
6. Validate the skill folder and the repository catalog.
7. Forward-test with a fresh task when the change is subtle or high-impact.

## Decision ledger

Return one row per finding:

| Finding | Decision | Destination | Reason | Validation |
| --- | --- | --- | --- | --- |
| F-001 | accepted | variants reference | repeated style-model issue | example + lint |

Use `needs-evidence` when the idea is plausible but the report cannot support a
durable rule. State exactly which artifact or reproduction would resolve it.
