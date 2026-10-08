# What slimming a skill taught us

Lessons from simplifying `build-composable-components` across seven benchmark
rounds (baseline 10,172 words → lean-v6 4,545 words, every task scored 100,
structure consistent across repetitions). Detail and evidence:
[build-composable-components/ITERATIONS.md](build-composable-components/ITERATIONS.md).

## What to keep

- **Rules the model gets wrong without the skill.** A control run without any
  skill showed which rules carry value: layer boundaries, ownership of state,
  slot-owned props, item identity, DOM-first styling, how audits judge
  over-engineering. These stayed, word for word where the wording was precise.
- **Decisions recorded from feedback.** Keep their outcomes; compress their
  wording only when the outcome provably stays the same.
- **One canonical, type-checked example.** Models copy examples almost name for
  name, so the example must follow every rule the text states.
- **Defaults that make output predictable.** File placement and naming defaults
  ("`components/ui/<role>.tsx`", "the composition reuses the role name
  verbatim") raised structural consistency from 54% to 91%.

## What to cut

- Generic knowledge a strong model already applies (instance isolation,
  controlled-only values, overlay placement, typed APIs, typecheck habits).
- Restatements: the same rule in a checklist, a reference, and an example. Say
  it once and link to it.
- Emphasis words and repeated warnings. A warning repeated four times became the
  reason runs refused to remove dead code.
- Examples that mirror likely tasks; they teach recall, not the principle.

## What breaks a skill

- **Added or reworded sentences, not deletions, caused every regression.** The
  model follows new wording literally:
  - "so a failure appears where the user can retry" made runs hoist one shared
    dialog above all rows;
  - "a nested root resets the variable, which group selectors do not" pushed runs
    back to React context for styling;
  - "report root causes, not only the visible broken class" made audits drop
    small convention findings.
- Shortening a precise boundary changes it: "JavaScript must read" lost
  "behavior, not only CSS", and runs started using context for styling again.
- A dual-mode code example made every run add an unrequested uncontrolled mode.

## How to write a rule

- One sentence, the rule, then its reason ("…, because copies drift apart").
- State the scope exactly (what is in and out), especially for exceptions.
- Prefer a rule over an example when both would teach the same thing; keep an
  example only when it carries a shape words cannot.
- Every new sentence is a hypothesis: measure it.
