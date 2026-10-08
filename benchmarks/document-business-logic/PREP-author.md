# document-business-logic lean-v1: author report

Candidate: `benchmarks/document-business-logic/variants/lean-v1/`, copied from
`skills/document-business-logic/` without README.md, registry.json, and
adapters/. Tasks, results, and other PREP files were not read.

## Word counts (wc -w)

| File | Baseline | lean-v1 |
| --- | ---: | ---: |
| SKILL.md | 719 | 741 |
| references/comment-contract.md | 485 | removed (merged into SKILL.md) |
| examples/wait-lock.tsx | 107 | 107 (unchanged) |
| agents/openai.yaml | 25 | 25 (unchanged) |
| **Total** | **1,336** | **873 (-34.7%)** |

SKILL.md is 106 lines (limit 220). Frontmatter `name` and `description` are
unchanged. Required sections kept: `## Version`, `## Layer placement`,
`## Required workflow`, `## Companion skill routing`; the core contract is now
the `## Business block` section.

## Cuts and merges

1. **Reference merged into SKILL.md, file deleted.** About 80% of
   `comment-contract.md` restated SKILL.md (format, placement, threshold,
   preserve list, other-standard rule, editing-existing rule, the example
   link). The unique content moved into SKILL.md once: the format block with
   field meanings, the threshold ("looks accidental, unnecessarily
   restrictive, or safe to delete"), the evidence sources, the removal list,
   the "different owner and purpose" reason, and the Wrong example.
2. **Core contracts + Completion check + reference "Default format/Comment
   threshold" merged into one `Business block` section.** Each rule now appears
   once: default to no comment, evidence for every field, one English sentence
   per line, one block at the owning declaration, zero-or-one block per
   ordinary edit.
3. **Workflow steps 2-3 merged.** The classification now states the action next
   to each class (product rule: block; technical docs: keep; narration: remove)
   and carries the full removal list, so the separate "What to remove" and
   "What to preserve" sections were dropped.
4. **Workflow steps 4 and 6 / reference "Editing existing comments" merged.**
   Placement went to the Business block section; scoped cleanup stays as step 4
   with its original wording.
5. **"Read focused guidance" section dropped.** Only the example link remained
   necessary; it now sits in the Right line after the Wrong example.
6. **Dropped the "Obvious code needs no comment" snippet**
   (`const isDisabled = isLocked || !isReady`). The canonical example already
   shows an uncommented derived value (`isReady`), and the rule is stated in
   text.
7. **Companion routing compressed** to a list with colons; the three companions
   and the ask-before-install / continue-if-declined / never-hidden-prerequisite
   policy are kept.

## Kept as is

- Layer placement paragraph (product rules only in the feature adapter; a
  comment needing a product reason in a primitive or generic family means the
  rule is in the wrong layer; route the move).
- "Document it" rule: use user-supplied purpose, reason, constraint; ask when
  missing; never derive a story from the call stack.
- The Wrong transport-timing example: it shows a technical symptom dressed as a
  `Why`, which a strong model writes without the skill.
- Example code: unchanged, so no re-typecheck was needed (still covered by
  `tsconfig.examples.json` at its source path). No scripts ship with this skill.

## Recorded decisions still satisfied

- 2026-09-07 F-007: remove only redundant narration, preserve supported
  rationale and required technical comments (workflow step 2).
- 2026-09-24 F-004 (write-feature-tests routes here; production function keeps
  the one block): one block at the owning declaration is kept.
- extract-named-helpers report F-007: a helper name replacing narration and the
  block at the helper declaration still follow from "prefer an expressive name
  ... focused function" and the owning-declaration rule.

## New or reworded sentences (risks to measure)

- "never put the block on an obvious derived value" replaces two lines ("Do not
  use the block to make obvious code look important" and "use the three
  headings around an obvious derived value").
- "Each field needs reliable evidence ... ask instead": merges the evidence
  sentence with the "ask instead of fabricating" line from the reference.
- "because it has a different owner and purpose" was in the reference; it now
  sits beside the preserve list in the workflow.
- Format placeholders now carry the field meanings
  (`[why the product needs it, not how the code achieves it]`) instead of
  three explanatory bullets.

## Uncertain / follow-up if adopted

- The live README.md and registry.json reference
  `references/comment-contract.md`; applying this variant needs
  `npm run skills:sync` and a README link update.
- Routing does not mention `$write-feature-tests`, `$extract-named-helpers`, or
  `$feature-sliced-design`, which also touch comments or ownership; the
  baseline did not either, so none was added.
- The example lives at `examples/wait-lock.tsx`, not under
  `features/<feature>/`; moving it would match the owner's placement bar but
  was left alone to avoid changing the one canonical example.
