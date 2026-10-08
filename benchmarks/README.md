# Skill benchmarks

Measures whether a skill variant makes a real agent write better code. Each run
gives one task to a subagent working in an isolated copy of a small fixture
app, then a blind grader scores the result against a fixed rubric.

The question each iteration answers: **can the skill say less and still get the
same or better result?** A `none` variant (no skill installed) is the control.
A rule that `none` already follows is something the model knows; a rule only
skill variants follow is the skill's real value. [LESSONS.md](LESSONS.md)
records what earlier rounds taught about writing a short skill.

## Layout

```text
benchmarks/
  fixture/                      acme-tasks app shared by most suites
  fixture-<name>/               extra fixtures (suite.json "fixture" picks one)
  scripts/bench.mjs             harness; every command takes --suite <skill>
  dashboard/index.html          multi-skill dashboard (data/index.json + data/<suite>.json)
  <skill>/                      one suite per skill in skills/
    suite.json                  skill, title, fixture, promoted variant
    tasks/<id>/task.json        prompt + fixed rubric (weights) for one task
    tasks/<id>/files/           files overlaid on the fixture for that task
    variants/<id>/              frozen skill snapshots (what gets installed)
    results/<iteration>/<run>/  run.json, grade.json, changes.patch, output/, REPORT.md
    results/pairs/<label>.json  blind A/B verdicts
    ITERATIONS.md               decisions taken after each iteration
```

Run results and dashboard data are large and stay out of git; the published
dashboard artifact, `ITERATIONS.md` files, and the decision ledgers in
`docs/skill-feedback/` keep the evidence.

Every suite has a `baseline` (the skill before slimming) and at least one
`lean-*` candidate. The dashboard's "Tüm skill'ler" view shows each skill's
baseline and current candidate side by side.

## Run with subagents (default)

The `skill-bench` user skill orchestrates this from a Claude Code session
through the `skill-bench-iteration` workflow, so no CLI login is needed.

```bash
node benchmarks/scripts/bench.mjs prepare --suite build-forms --work-root <scratch> --iteration it0 --variants baseline,lean-v1,none --reps 2 --model claude-opus-5-5 --effort high
```

Pass the printed JSON as the workflow's `args`, then:

```bash
node benchmarks/scripts/bench.mjs ingest --suite build-forms --work-root <scratch> --iteration it0
node benchmarks/scripts/bench.mjs metrics --suite build-forms --work-root <scratch> --iteration it0 --dir <workflow transcript dir>
node benchmarks/scripts/bench.mjs report --suite build-forms
```

When the rubric saturates, compare two variants blind:

```bash
node benchmarks/scripts/bench.mjs pair-prep-all --suite build-forms --work-root <scratch> --a it0:baseline --b it1:lean-v2 --label baseline-vs-lean-v2
```

Run the `skill-bench-pairwise` workflow with the printed args, then
`pair-ingest --label baseline-vs-lean-v2`.

## Benchmarking a new model

The subject model is a property of the iteration. To test a new model, start a
new iteration with `prepare --model <id>`; `prepare` refuses to reuse an
iteration that ran with a different model. Graders and judges stay on a fixed
model so scores remain comparable, and the dashboard shows the model per run.

## Run with the headless CLI

Log the CLI in once (`claude auth login`) and install fixture dependencies:

```bash
npm --prefix benchmarks/fixture install
```

```bash
node benchmarks/scripts/bench.mjs run --suite build-composable-components --iteration it1 --variants baseline,lean-v2,none --reps 2
node benchmarks/scripts/bench.mjs grade --suite build-composable-components --iteration it1
node benchmarks/scripts/bench.mjs report --suite build-composable-components
```

`run` and `grade` skip finished runs, so they resume after interruption.
Override the model with `BENCH_MODEL`, `BENCH_EFFORT`, and the grader with
`BENCH_GRADER_MODEL`, `BENCH_GRADER_EFFORT`.

## How a run works

1. Copy the suite's fixture plus the task overlay into a directory outside the
   repository, commit it, and link `node_modules`.
2. Install the variant at `.claude/skills/<skill>/` (nothing for `none`).
3. The subject sees no CLAUDE.md and no other skills. Skill variants get the
   prompt prefix `Use the <skill> skill.`
4. Record the diff, typecheck result, heuristic anti-pattern counts, which
   skill files were read, context tokens, and time. A run that read files
   outside its workspace is invalid.

## How grading works

A separate Opus session reads the end state, `CHANGES.patch`, and the agent's
final message without knowing the variant, and scores every rubric criterion
1 / 0.5 / 0 with evidence, plus an overall 1-10. Each suite's rubric is derived
from the original skill and stays fixed, so a lower score on a criterion means
the simplified variant lost that guidance. If a rubric must change, version it
and re-grade every variant.

With two repetitions, a difference under about five points is noise: read the
evidence, compare repetitions, and open the code before acting on it.
