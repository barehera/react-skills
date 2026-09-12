# September 2026 feedback decisions

The user's corrected reports replace the earlier September 1 pair. Those earlier
reports caused no edits. These two original reports are preserved unchanged:

- [Stack library defaults](use-preferred-react-stack/2026-09-07-stack-library-defaults.md)
- [Helper extraction boundaries](extract-named-helpers/2026-09-03-helper-extraction-boundaries.md)

The documented `docs/skill-feedback` fallback is used because `.agents` is
read-only in this workspace. Both original reports pass the canonical validator.
Product commits, usage counts, and quoted project files are reported evidence;
the originating repository is unavailable and those claims were not independently
reproduced. Catalog comparisons and package API verification were performed here.

## Scope and design

`use-preferred-react-stack` owns selecting libraries, verified imports, setup
prerequisites, and small integration idioms. It routes component, form, server
state, and placement work to existing owners. `extract-named-helpers` owns
extraction decisions, signatures, names, and pure-helper/hook boundaries.
Neither requires a new state manager or rewrites a consuming project.

The catalog already has an opinionated technology contract, contrary to the
report's description of the installed older guidance. The stack addition extends
unowned concerns with Pacer, nuqs, next-intl, sonner, typed Next env, and configured
React Compiler. Existing React Hook Form, Zod, Zustand, Axios, Query, and
shadcn/Radix choices remain canonical. No existing app migration is required;
incumbents remain supported as integration boundaries, not alternate canonical
examples. Runtime packages for examples are dev dependencies with caret ranges.

## Stack report

| Finding | Decision | Destination and reason | Validation |
| --- | --- | --- | --- |
| F-001 | adapted | New skill and technology contract: selection table with boundaries; preserve opinionated companion skills and small local state | Table review, typed search hook, catalog validation |
| F-002 | accepted | Pacer reference and export verifier; corrected paths, retaining real `useRateLimiter` and `useQueuedState` exports | All 0.18.0 subpaths resolve; named exports load; timing tests |
| F-003 | adapted | Scoped preferences store/provider and browser-only banner example; SSR isolation, explicit hydration, partial persistence; placement routes to FSD | Isolation, hydration, reset, persistence tests and typecheck |
| F-004 | adapted | Compiler contract plus component state/review references: inspect enabled build config, preserve unrelated legacy calls; measured exceptions need no blanket approval ritual | Reference review and new examples contain no manual memoization |
| F-005 | accepted | Reciprocal routing in forms, server state, and components, plus READMEs | Catalog publication and routing review |
| F-006 | project-only | No consuming Cursor rules changed; README invocation/install guidance enables optional pointer adoption later | Source scope review |

## Helper report

| Finding | Decision | Destination and reason | Validation |
| --- | --- | --- | --- |
| F-001 | adapted | Entrypoint triggers and focused reference; counts are signals, not mandatory extraction of every branching handler | Complete inspection example, boundary tests |
| F-002 | adapted | Inline and hoisting rules; preserve order, exceptions, and call count before moving effects | Inline `canPublish`, manual control-flow review |
| F-003 | adapted | Placement reference: several same-module callers stay private; cross-module reuse follows business owner; dedicated modules allowed for real boundaries | Two private error predicates, reused domain predicate |
| F-004 | accepted | Minimal structural input and single-field boundary | Typecheck and partial-object completion tests |
| F-005 | adapted | Verb table: preserve repository vocabulary and explicit mutation semantics; `reset` does not universally mean a copy | Pure factory naming, immutable restart test |
| F-006 | adapted | Hook/helper split; extract useful pure decisions to module scope, not every expression; module scope does not memoize | Typed hook with complete dependencies, completion tests |
| F-007 | adapted | Route comments to documentation owner; remove only redundant narration, preserve supported rationale and required technical comments | Scope/reference review |

The supplied request to write installed `.agents/skills` paths is adapted to
canonical `skills/` source packages. The reports' manual VERSION bump is not
applied: repository release automation owns the shared version. The helper
forward-test's suggested multi-consumer placement is not assumed when the
prompt shows only one consumer; actual callers determine export/placement.

## Adjacent catalog review

Forms now express fresh-stack defaults without requiring the user to repeat
the same library choice. Server state now names Axios/Query for a fresh stack
while preserving incumbents. Components' review wording no longer implies
repository-wide removal of legacy memoization. All three route helper/library
decisions to their new owners and preserve their structural responsibilities.

Reviewed `document-business-logic` and `feature-sliced-design`: their existing
comment and business-ownership rules already supply the needed boundaries;
no duplicate policies or unrelated source edits were warranted. Feedback
capture already distinguishes portable proposals from origin evidence.

## Verification and limits

Package exports and TypeScript examples use installed dependencies. The behavior
suite exercises immutable extraction, empty/null boundaries, error composition,
store isolation/persistence, and Pacer timing/cancellation. The search walkthrough
provides the fresh-task composition and identifies provider, navigation, and
browser checks required in a consuming app. This is local scenario review and
executable example validation, not an independent agent or browser forward-test.

Completed checks:

- Both supplied reports: canonical feedback validator passed (6 + 7 findings).
- Both new skills: official `quick_validate.py` passed; UI metadata generated
  with the official generator. PyYAML was installed only in an ignored local
  validation directory to run those tools.
- `npm run validate`: eight catalog skills, canonical feedback fixture,
  interactive listing, TypeScript examples, Pacer export verification, six
  passing behavior tests, and shadcn registry build.
- `git diff --check`: no whitespace errors after normalizing the edited README.

The working tree began with unmerged index entries for `README.md` and
`registry.json`, existing feature-sliced-design additions, a technology guide
edit, and an untracked feedback folder. Existing work and Git index state are
preserved. Only the current working-file catalog entries are extended.
