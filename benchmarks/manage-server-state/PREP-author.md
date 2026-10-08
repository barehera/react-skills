# manage-server-state lean-v1: author report

Candidate: `benchmarks/manage-server-state/variants/lean-v1/`, copied from
`skills/manage-server-state/` without README.md, registry.json, or adapters/.
Not read: `tasks/`, any `results/`, other `PREP-*.md`.

## Word counts (wc -w)

| File | Baseline | lean-v1 |
| --- | ---: | ---: |
| SKILL.md | 1148 | 993 |
| references/architecture.md | 568 | 611 (absorbs placements.md) |
| references/placements.md | 343 | removed |
| references/naming.md | 384 | 294 |
| references/backend-contracts.md | 1145 | 959 |
| references/queries.md | 497 | 426 |
| references/mutations-cache.md | 558 | 500 |
| references/workflows.md | 832 | 537 |
| references/examples.md | 776 | removed |
| **Prose total** | **6251** | **4320 (-30.9%)** |
| examples/ (.ts) | 2349 | 2349 (unchanged) |
| agents/openai.yaml | 43 | 43 (unchanged) |

SKILL.md is 142 lines and keeps frontmatter (name and description verbatim),
`## Version`, `## Layer placement`, `## Required workflow`, `## Core contracts`,
`## Companion skill routing`, `## References`, `## Decision defaults`.

Example code is byte-identical to the source. It type-checks against the
repo's TypeScript from a scratch tsconfig
(`.../scratchpad/prep/manage-server-state-author/tsconfig.json`, same options as
`tsconfig.examples.json`, `@/*` mapped to the variant): `tsc` passed. The skill
ships no scripts.

## SKILL.md

- **Version**: dropped the sentence explaining that VERSION is the catalog
  release, with no skill-local version. The handoff rule stays. (Same cut as bcc
  lean-v6.)
- **Layer placement**: verbatim.
- **Required workflow**: 10 steps became 7.
  - Old steps 2 (inspect) and 4 (profile) merged into one step that links the
    profile table in architecture.md. The profile keeps validation commands.
  - Old step 5 (contract resolution) is compressed and links the evidence
    order. "Never invent routes, fields, envelopes, page parameters, or auth
    requirements" is kept verbatim.
  - Old step 7 (the list of references to read) moved to `## References`.
  - Old step 10 (report) now also covers the items from workflows.md's deleted
    "Completion report" section: layout, evidence quality, dependencies added,
    cache policy, and runtime inspection.
- **Operating rule** became `## Core contracts`. The three decision groups are
  kept. The non-blocking schema-drift paragraph is kept verbatim. It is the
  recorded "Non-blocking schema drift" decision (commit 80c2702).
- **Companion routing**: the old "Defaults, not mandates" routing paragraph
  merged into this section.
  - Its `$use-preferred-react-stack` and `$extract-named-helpers` routes are
    kept. These are the reciprocal routing from 2026-09-07 F-005.
  - "Public operation inputs and cache action vocabulary stay owned here;
    helper defaults do not override them" is kept.
  - The second "recommend absent companion once" sentence was a restatement and
    is cut.
  - The install wording now matches bcc lean-v6. The outcome is the same:
    explain once, install only on approval, use the supported installer or
    npx, and don't ask again.
- **Defaults**: every bullet kept.
  - The two transport bullets merged into one: "existing Axios, fetch, or
    generated-client transport; for a fresh stack, Axios through a project
    wrapper and TanStack Query. Never add a second client." This keeps the
    2026-09-07 outcome, "Axios/Query for a fresh stack while preserving
    incumbents".
  - The "Do not force ..." line is verbatim.
- **Reference implementation**: the section became the examples entry under
  References. It keeps "Copy its reasoning, not its backend contract or paths"
  and the replace-every-route/schema/... list. "Map into other placements
  instead of duplicating" moved to architecture.md.

## References

- **architecture.md + placements.md merged** (911 words became 611). Both
  placement tables were combined into one.
  - The feature-colocated tree is kept exactly as in placements.md.
  - The server-state-rooted tree (about 40 lines) is replaced by its mapping
    rule (`src/server-state/*` to `shared/*`, feature folder to
    `src/server-state/posts/*`). Its no-scattering rule and direct-import /
    no-barrel rule are kept.
  - The two "shared only when..." rules from the two files merged into one.
  - The responsibilities list became one sentence.
  - The dependency diagram is kept.
  - Removed the "bind QueryClient once" bullet. It restated SKILL defaults and
    mutations-cache.
- **naming.md**
  - The vocabulary code block is replaced by one sentence pointing at
    `src/server-state/names.ts` in the example (the same content).
  - Removed "For a new vocabulary, prefer `detail`", which the defaults already
    state.
  - Cache verbs (`setDetail`/`patchDetail`/`invalidate*`/`remove*`) moved into
    mutations-cache "Cache semantics", so they are stated once.
  - The namespace table and the call-site naming block are verbatim.
- **backend-contracts.md**
  - Evidence order: the five steps are kept. The "ask once, don't ask for what
    you already have" rule merged into step 3.
  - From workflows/examples, added "do not call an endpoint only because a URL
    was given", plus "narrowest honest contract, report uncertainty".
  - The JSON inference rules are kept. The schema-tolerance sentence is
    verbatim, merged with the `.passthrough()` rule.
  - The runtime-fallback safety bullets keep their original boundary wording
    ("Limit default probing...", "Never probe production, trigger deliberate
    error cases, or submit guessed payloads without explicit user
    authorization"). "Never execute a mutation solely to discover its contract
    or cache effects" merged here from mutations-cache.md and examples.md.
  - Schema drift: the section restating it, and a transport bullet that also
    restated it, were cut to one sentence pointing at `parseApiPayload`.
    "Deliberately favoring application continuity" is kept.
  - Cut: "If the tool cannot inspect traffic, ask for docs/JSON/HAR/cURL"
    (already step 3 of the evidence order).
- **queries.md**
  - "Comments keyed under post only when the cache model owns them" (from
    examples.md) is folded into the context-key rule as "otherwise use the
    child resource's own key".
  - The authenticated-factory instantiation code is kept.
  - The second code block (`usePostRelatedQuery` with
    `useAuthenticatedQuery`) is replaced by one sentence: call
    `useAuthenticatedQuery` where the hook would call `useQuery`.
  - "Transport returns unchanged" is cut here; it stays in backend-contracts.
  - The skipToken, `enabled` composition, no public alias, and uninstantiated
    factory rules are kept.
- **mutations-cache.md**
  - The `createPostsCache`/`usePostsCache` code block is cut. It restated
    `examples/.../cache/index.ts` and `use-cache.ts`; the replacement sentence
    gives the shape and the file names.
  - "Use the backend result and mutation variables; don't invalidate by habit"
    merged into "Choosing mutation effects".
  - From examples.md, added "the example's Posts writes leave `related` alone;
    verify".
  - The optimistic-update steps and the error-reporting rule are kept.
- **workflows.md**
  - Cut "Discover an endpoint contract" and "Endpoint supplied without
    documentation". They restated the evidence order and safety rules; their
    unique sentences moved to backend-contracts.
  - The six quoted questions became one sentence listing the same topics.
  - The "new architecture" recommendation question is cut; the placement
    default lives in architecture.md.
  - "Create from scratch" step 1 (inspect) is cut because workflow step 2
    covers it.
  - "Create feature" steps 4 and 5 merged.
  - "Refactor" absorbs the `byId`/`detail` layer-project example from
    examples.md.
  - The audit checklist keeps all 16 checks, merged into 13 lines.
  - "Completion report" moved to SKILL step 7.
- **examples.md deleted**.
  - Its user-request walkthroughs (generated client, bookmarks with OpenAPI,
    raw JSON, no contract, undocumented mutation, adapt placement, child
    endpoint, protected query, refactor) mirror likely tasks and restate rules
    stated elsewhere.
  - Each one's unique rule was moved:
    - generated types over Zod: contract strategy;
    - JSON id/url not branded: "keep strings as strings";
    - no immediate endpoint call: evidence order;
    - mutation not executed: fallback safety;
    - placement mapping: architecture;
    - child key: queries;
    - protected query: queries;
    - `related` cache caveat: mutations-cache;
    - refactor aliases: workflows.

## Owner's bar

The skill already defaults domain code to `features/<feature>/server-state` and
shared primitives to `src/server-state`. No rule was added for the
components/ui or variant points, because they belong to build-composable-components.
Adding sentences is the main regression risk (LESSONS.md).

## Uncertain

- The cache-factory code block in mutations-cache.md was cut in favor of a
  pointer to the example. If runs stop binding QueryClient once (for example,
  passing it to each action), restore it.
- The server-state-rooted tree was cut and replaced by its mapping. Runs in
  repos that avoid feature folders may vary their per-resource file sets more.
- Fewer worked examples (examples.md) may weaken behavior in the
  "URL only, no contract" case. The rule is now in evidence order: "do not call
  an endpoint only because a URL was given".
- The reduction is 30.9% of prose, close to the 30% floor. Further cuts would
  have to hit the audit checklist, the JSON-inference list, or the namespace
  table, all of which encode opinionated or boundary rules.
- The example code (2349 words) was left untouched, because it is the canonical
  typed composition models copy.
