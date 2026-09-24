# September 24 2026 feedback decisions

The original report is preserved unchanged and passes the canonical validator:

- [Reusable rule tests](../../.agents/feedback/write-feature-tests/2026-09-24-reusable-rule-tests.md)

## Target skill

The report targets `write-feature-tests` at React Skills v1.11.0. That skill is
not in this catalog: no source folder, branch, commit, or pull request contains
it, so the consuming project's installed copy came from outside this repository.
The report's "current behavior" sections quote that installed copy, and those
quotes could not be compared against a source here.

The user chose to create `write-feature-tests` as a new source skill built
around the four findings, with a matching technology-contract change. Nothing
from the unavailable installed copy is carried over except behavior the report
describes and this catalog independently supports: tests locked on named
decisions, one file per decision, and routing to `$document-business-logic`.

## Stack change

| Item | Decision |
| --- | --- |
| Concern | Unit and contract tests for feature-adapter decisions |
| Canonical tool | Vitest in a Node environment, added to the technology contract |
| Existing projects | Not migrated; the skill uses the repository's runner and never adds a second one |
| Affected skills | New `write-feature-tests`. Existing skills already say not to introduce a test framework only for one change; that stays true, because this skill adopts Vitest only where no runner exists |
| Boundaries | HTTP and cache contracts stay with `manage-server-state`; family and form interaction tests stay with their owners; placement stays with `feature-sliced-design` |

## Findings

| Finding | Decision | Destination | Reason | Validation |
| --- | --- | --- | --- | --- |
| F-001 | accepted | `SKILL.md` workflow step 3 and Case tables; runner contract in the reference; shared runner example | Structural and high-impact; the report's neutral `canSubmit` example is used as-is | Typed `testRule` infers input and result; example tables run in Vitest |
| F-002 | accepted | `SKILL.md` When a rule changes; worked `force` change in the reference | Applies every time a rule moves; the rename counterexample is kept as an explicit exclusion | Reference review against the report's fresh-task prompt |
| F-003 | adapted | `SKILL.md` Fixtures are not config defaults; defaults contract example; one-file-per-decision default | Accepted as proposed, plus one boundary found while forward-testing: a row that reads the loader fails its whole file at collection, so each decision keeps its own file to keep unrelated tables running | Added a required schema field with no default: the contract test failed on the key and parse checks, `canSubmit` rows kept passing, only the default-dependent table failed; restored |
| F-004 | accepted | `SKILL.md` workflow step 6 and Companion skill routing | The single owner is the imported production function; wording routes to `$document-business-logic` | Example test files contain no Business Logic comment; `submission.ts` keeps one block per decision |

## Project-only items

The report's cross-cutting note is honored: hosted-runner names, banned browser
vendors, and the local `tests/unit` grouping stay project policy. The skill
lists them as project policy in its decision defaults and reference. The
example uses `tests/unit` and `tests/contract` only as one concrete layout.

## Verification and limits

`npm run validate` type-checks the example and runs it with Vitest. The
defaults forward-test was performed locally by editing and restoring the
example schema. The rule-change scenario is shown as a worked reference, not as
an independent fresh-agent run.
