# PREP: lean-v1 author report (evolve-skills-from-feedback)

Variant: `benchmarks/evolve-skills-from-feedback/variants/lean-v1/`, copied from
`skills/evolve-skills-from-feedback/` without `README.md`, `registry.json`, and
`adapters/`. I did not read `tasks/`, any `results/`, or other `PREP-*.md` files.
I did not write `lean-v1.meta.json`; the harness creates it.

## Word counts (wc -w)

| File | Baseline | lean-v1 | Change |
| --- | ---: | ---: | ---: |
| SKILL.md (core) | 1300 | 1020 | -21.5% |
| references/evaluation-and-integration.md | 407 | 309 | -24% |
| references/feedback-format.md | 576 | 153 | -73% |
| references/worked-example.md | 372 | 214 | -42% |
| assets/skill-feedback-template.md | 316 | 271 | -14% |
| examples/composable-component-feedback.md | 338 | 338 | 0 |
| **Markdown total** (the meta.json "total") | **3309** | **2305** | **-30.3%** |
| agents/openai.yaml | 35 | 35 | unchanged |
| scripts/validate-feedback.mjs | 393 | 393 | unchanged |

SKILL.md is 139 lines (limit 220). Its description is 412 characters.

## SKILL.md

- **Structure:** `## Choose the mode`, `## Capture mode`, and `## Ingest mode`
  now sit under one `## Required workflow` heading, with the two modes as `###`
  subsections. This puts the skill on the quality-contract section list
  (Version, Layer placement, Required workflow, Companion skill routing).
  Section order now follows `adding-a-skill.md`: workflow and rules come before
  routing. No rule changed.
- **Description:** "review proposed rule changes, plan updates to a source
  skill, or implement and validate approved skill improvements" became
  "review, plan, or apply source-skill improvements". The triggers are the same.
  "feedback guide" is kept as written.
- **Intro:** I cut the paragraph explaining why Markdown with YAML is
  preferred. Its reason now appears once, in feedback-format.md.
- **Mode list:** the wording is tighter. All three modes, "do not rewrite the
  installed source skill", and "Do not assume permission to edit a separate
  repository" are kept.
- **Capture intro:** kept with its boundary: the reusable sections describe a
  skill rule, reference, example, or validator, and only a finding classified
  as `project-convention` may recommend a consuming-repo change. "or other
  skill artifact" was dropped because the list already covers it.
- **Capture step 2:** "Keep project paths and export names in Evidence" moved
  into the Evidence rules bullet, which now reads "origin excerpts, project
  paths, and export names". It is stated once.
- **Capture step 4:** the six-item field list became a two-group sentence
  (observations vs proposals). The template lists every field and the
  validator checks them, so the full list was a restatement. Severity,
  recurrence, and confidence are no longer named in the core file. They remain
  in the template, and the validator requires them.
- **Capture step 6 (deletion gate):** the wording is tighter. "proposal
  sections, examples, and fresh-task test" stands for the original "preferred
  behavior, proposed change, examples, acceptance criteria, and fresh-task
  test", and the capture intro names those sections. The outcome is the same:
  rewrite or classify as `project-convention`, and keep the origin evidence.
- **Capture step 7:** the path and the `docs/skill-feedback/` fallback are
  verbatim. The 2026-09-07 ledger relies on this fallback, and it still works.
- **Capture checklist:** cut. It restated steps 3, 6, and 7.
- **Ingest step 1:** now links to the format reference for normalization. The
  JSON and plain-text rules live there once.
- **Ingest step 2:** merged into one sentence. It still names the same files
  and the two React Skills guides.
- **Ingest step 5 (destination list):** cut from the core. It duplicated the
  destination table in evaluation-and-integration.md, and step 5 already says
  to read that file before choosing placement. Its "tool failure" signal moved
  into that table's "No change" row.
- **Ingest steps 6 and 7:** combined with the old step 8. The review, plan, and
  apply actions and all six decision values are verbatim. "Keep unresolved
  product choices explicit" moved here from the Completion contract.
- **Completion contract section:** cut. It restated the capture intro, the
  deletion gate, ingest step 7, and the ledger.
- **Evidence rules:** I cut "Prefer a rule that states ownership and decision
  criteria over a copied fix", because capture step 3 ("convert each
  observation into an ownership or decision rule with a boundary") and the
  integration step "smallest rule that explains the accepted behavior" already
  carry it. The rest is kept, including the `origin (do not ingest)` and
  `skill example (ingest this)` labels, the redaction list, one claim per
  finding, no unscoped `always` or `never`, and the accepted implementation
  outranking an intermediate correction.
- **Layer placement, Version, and Companion skill routing:** unchanged,
  including the quality-contract checklist bullet.

## references/feedback-format.md

- Kept: the reason for using Markdown, every metadata field rule (schema 1,
  `unversioned`, anonymized but distinct `source_project`, `YYYY-MM-DD`, the
  four status values), and the JSON and plain-text section.
- Moved: "ready only after the deletion gate" now sits on the `status` field.
- Cut: the "Audience and portability contract", which restated the capture
  intro, the Evidence rules, and the deletion gate.
- Cut: the file-location section. It is in SKILL.md step 7.
- Cut: the frontmatter YAML sample, the section and subsection list, the
  "Validation Requested" paragraph, and the ready-to-ingest checklist. The
  template shows all of these, its placeholders carry each subsection's
  meaning, the validator enforces them, and the checklist restated SKILL.md.
  One new sentence replaces them: every template heading and field is
  required, and `validate-feedback.mjs` checks them. The validator already
  behaves this way.
- Kept the file name, because `docs/adding-a-skill.md` links to it as the
  canonical report format.

## references/evaluation-and-integration.md

- The five-dimension strong/weak table is now one sentence. The two evidence
  columns were generic knowledge. The opinionated part is kept verbatim: a
  weak dimension changes placement and does not reject the finding.
- The destination table is kept. "a tool failure" was added to the "No change"
  signals when the core list was merged into it.
- Cut from the integration steps: "Rebase against the current version" (it is
  in ingest step 2) and "Validate the skill folder and catalog" (it is in
  ingest step 6 and in the routing bullet).
- The decision ledger table and the `needs-evidence` rule are kept verbatim.

## references/worked-example.md

- The captured-finding bullet list is gone. It repeated
  `examples/composable-component-feedback.md` word for word, so the reference
  now links to that report and keeps a one-line summary of the principle and
  its boundary.
- The integration decision is kept, including no blanket formatter rule
  because the decision is semantic, not line length.
- The InvoicePanelTitle feature-bound vs portable example is kept verbatim,
  including both snippets.
- The closing deletion-gate paragraph is now one line. The gate itself lives
  in SKILL.md step 6.

## assets/skill-feedback-template.md and examples/

- Template: every heading, field, and enum is unchanged. Only the placeholder
  prose is shorter. "Originating feature names belong here only" stays under
  Evidence, and "improves the named skill, not the product feature" stays in
  the Executive Summary. The consuming-path warning was removed from the
  "Proposed skill change" placeholder. The capture intro states it, and the
  validator rejects `app/` and `features/` paths for `ready` reports.
- Example report: unchanged. It is the canonical validated fixture.

## Verification

- `node scripts/validate-feedback.mjs examples/composable-component-feedback.md`
  passes: 1 finding.
- On the template, the validator reports the same three placeholder errors as
  the baseline template and no missing sections. The template structure is
  therefore unchanged.
- The script and `agents/openai.yaml` are byte-identical to baseline, ignoring
  line endings.
- All relative links in SKILL.md and the references resolve to files in the
  variant.
- No TypeScript example code changed, and this skill ships none in
  `tsconfig.examples.json`, so no type-check was needed.

## Uncertain

- The core file is only 21.5% shorter. The 30% target is met across all
  Markdown (-30.3%). The core's remaining weight is the opinionated
  enumerations and boundaries, which I kept verbatim.
- Moving the destination list out of the core assumes the agent reads
  evaluation-and-integration.md, as ingest step 5 requires. A weaker model that
  skips references could pick destinations less precisely.
- Severity, recurrence, and confidence are named only in the template and the
  validator now, not in the core.
- Companion routing still names only four skills. The catalog also has
  `use-preferred-react-stack`, `extract-named-helpers`, `write-feature-tests`,
  and `feature-sliced-design`. I did not add them, because the lessons warn
  that every added sentence is a risk. This should be decided separately.
- The owner's structural bar (`components/ui` roles, `features/<feature>`,
  typed size/variant) is not a topic this skill teaches directly. The only
  place it appears is the worked example's Tailwind finding, which is
  unchanged in substance.
