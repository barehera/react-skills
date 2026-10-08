#!/usr/bin/env node
// Skill benchmark harness: runs real headless Claude Code sessions against an
// isolated fixture app with different skill variants, then grades the results
// blind against a fixed rubric. See benchmarks/README.md.
import { spawn, spawnSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs"
import { homedir, tmpdir } from "node:os"
import { basename, dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const repoRoot = resolve(root, "..")
// One suite per skill: benchmarks/<suite>/{suite.json, tasks, variants, results}.
// `--suite` selects it; the default keeps the original single-suite commands working.
let suiteId, skillName, suiteDir, tasksDir, variantsDir, resultsDir, fixtureDir
function useSuite(id) {
  suiteId = id
  suiteDir = join(root, id)
  const config = readJson(join(suiteDir, "suite.json"), {})
  skillName = config.skill ?? id
  fixtureDir = join(root, config.fixture ?? "fixture")
  tasksDir = join(suiteDir, "tasks")
  variantsDir = join(suiteDir, "variants")
  resultsDir = join(suiteDir, "results")
}
const dashboardDir = join(root, "dashboard")
let workRoot = process.env.BENCH_WORK_ROOT ?? join(tmpdir(), "react-skills-bench")

const MODEL = process.env.BENCH_MODEL ?? "claude-opus-5-5"
const EFFORT = process.env.BENCH_EFFORT ?? "high"
const GRADER_MODEL = process.env.BENCH_GRADER_MODEL ?? MODEL
const GRADER_EFFORT = process.env.BENCH_GRADER_EFFORT ?? "high"
const RUN_TIMEOUT_MS = 45 * 60 * 1000

// ---------------------------------------------------------------- utilities

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith("--")) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      if (next === undefined || next.startsWith("--")) args[key] = true
      else args[key] = argv[++i]
    } else args._.push(arg)
  }
  return args
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, "utf8"))
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n")
}

function listFiles(dir, base = dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (name === "node_modules" || name === ".git") return []
    return statSync(full).isDirectory()
      ? listFiles(full, base)
      : [relative(base, full).replaceAll("\\", "/")]
  })
}

function copyTree(from, to) {
  for (const file of listFiles(from)) {
    mkdirSync(dirname(join(to, file)), { recursive: true })
    cpSync(join(from, file), join(to, file))
  }
}

function findClaude() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN
  const which = spawnSync(process.platform === "win32" ? "where" : "which", [
    "claude",
  ])
  if (which.status === 0) return which.stdout.toString().split(/\r?\n/)[0]
  const appData =
    process.env.APPDATA ?? join(homedir(), "AppData", "Roaming")
  const base = join(appData, "Claude", "claude-code")
  const candidates = existsSync(base)
    ? readdirSync(base)
        .flatMap((version) =>
          readdirSync(join(base, version)).map((hash) =>
            join(base, version, hash, "claude.exe")
          )
        )
        .filter((path) => existsSync(path))
        .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
    : []
  if (!candidates.length) {
    throw new Error("Claude Code CLI not found. Set CLAUDE_BIN.")
  }
  return candidates[0]
}

async function pool(items, concurrency, worker) {
  const results = []
  let next = 0
  async function lane() {
    while (next < items.length) {
      const index = next++
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, lane))
  return results
}

function runClaude(args, cwd, outFile) {
  return new Promise((resolvePromise) => {
    const started = Date.now()
    const child = spawn(findClaude(), args, {
      cwd,
      env: { ...process.env, CLAUDECODE: "" },
      stdio: ["ignore", "pipe", "pipe"],
    })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (chunk) => (stdout += chunk))
    child.stderr.on("data", (chunk) => (stderr += chunk))
    const timer = setTimeout(() => child.kill(), RUN_TIMEOUT_MS)
    child.on("close", (code) => {
      clearTimeout(timer)
      if (outFile) writeFileSync(outFile, stdout)
      resolvePromise({ code, stdout, stderr, ms: Date.now() - started })
    })
  })
}

function git(cwd, ...args) {
  return spawnSync(
    "git",
    // core.longpaths: suite workspaces nest deep enough to pass Windows MAX_PATH.
    ["-c", "user.email=bench@local", "-c", "user.name=bench", "-c", "core.longpaths=true", ...args],
    { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  )
}

// ---------------------------------------------------------------- tasks and variants

function loadTasks(filter) {
  const ids = readdirSync(tasksDir).filter((id) =>
    existsSync(join(tasksDir, id, "task.json"))
  )
  const wanted = !filter || filter === "all" ? ids : filter.split(",")
  return wanted.map((id) => ({
    ...readJson(join(tasksDir, id, "task.json")),
    dir: join(tasksDir, id),
  }))
}

// variant id "none" means no skill installed.
function variantSkillDir(id) {
  if (id === "none") return null
  const dir = join(variantsDir, id)
  if (!existsSync(join(dir, "SKILL.md"))) {
    throw new Error(`Variant ${id} has no snapshot. Run: bench snapshot ${id}`)
  }
  return dir
}

const installedSkillFiles = (path) =>
  !path.startsWith("adapters/") &&
  path !== "README.md" &&
  path !== "registry.json"

function snapshot(args) {
  const id = args._[1]
  if (!id || id === "none") throw new Error("Usage: bench snapshot <id> [--git <ref>]")
  const dest = join(variantsDir, id)
  if (existsSync(dest) && !args.force) {
    throw new Error(`Variant ${id} exists; pass --force to overwrite.`)
  }
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dest, { recursive: true })
  const skillPath = `skills/${skillName}`
  if (args.git) {
    const list = git(repoRoot, "ls-tree", "-r", "--name-only", args.git, skillPath)
    for (const file of list.stdout.split("\n").filter(Boolean)) {
      const rel = file.slice(skillPath.length + 1)
      if (!installedSkillFiles(rel)) continue
      const content = spawnSync("git", ["show", `${args.git}:${file}`], {
        cwd: repoRoot,
        maxBuffer: 64 * 1024 * 1024,
      }).stdout
      mkdirSync(dirname(join(dest, rel)), { recursive: true })
      writeFileSync(join(dest, rel), content)
    }
  } else {
    const from = resolve(repoRoot, args.path ?? skillPath)
    for (const rel of listFiles(from).filter(installedSkillFiles)) {
      mkdirSync(dirname(join(dest, rel)), { recursive: true })
      cpSync(join(from, rel), join(dest, rel))
    }
  }
  writeJson(join(dest, "..", `${id}.meta.json`), {
    id,
    source: args.git ? `git:${args.git}` : `path:${args.path ?? skillPath}`,
    note: args.note ?? "",
    createdAt: new Date().toISOString(),
    words: skillWords(dest),
  })
  console.log(`snapshot ${id}: ${listFiles(dest).length} files, ${skillWords(dest).total} words`)
}

function skillWords(dir) {
  const count = (file) =>
    readFileSync(join(dir, file), "utf8").split(/\s+/).filter(Boolean).length
  const md = listFiles(dir).filter((file) => file.endsWith(".md"))
  return {
    core: existsSync(join(dir, "SKILL.md")) ? count("SKILL.md") : 0,
    total: md.reduce((sum, file) => sum + count(file), 0),
  }
}

// ---------------------------------------------------------------- workspace

function prepareWorkspace(task, variant, runId, iteration) {
  const ws = join(workRoot, iteration, runId)
  rmSync(ws, { recursive: true, force: true })
  mkdirSync(ws, { recursive: true })
  copyTree(fixtureDir, ws)
  if (existsSync(join(task.dir, "files"))) copyTree(join(task.dir, "files"), ws)
  writeFileSync(join(ws, ".gitignore"), "node_modules\n.claude\n")
  git(ws, "init", "-q")
  // A missing base commit makes every later diff empty, so fail loudly.
  for (const step of [["add", "-A"], ["commit", "-qm", "base"]]) {
    const out = git(ws, ...step)
    if (out.status !== 0) throw new Error(`git ${step[0]} failed in ${ws}: ${out.stderr}`)
  }
  symlinkSync(join(fixtureDir, "node_modules"), join(ws, "node_modules"), "junction")
  const skillDir = variantSkillDir(variant)
  if (skillDir) {
    const target = join(ws, ".claude", "skills", skillName)
    copyTree(skillDir, target)
    writeFileSync(join(ws, ".claude", "skills", "VERSION"), "2.0.1\n")
  }
  return ws
}

function promptFor(task, variant) {
  return variant === "none"
    ? task.prompt
    : `Use the ${skillName} skill.\n\n${task.prompt}`
}

// ---------------------------------------------------------------- transcript

function summarizeTranscript(stdout) {
  const events = stdout
    .split(/\r?\n/)
    .filter((line) => line.startsWith("{"))
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter(Boolean)
  const init = events.find((event) => event.type === "system" && event.subtype === "init")
  const result = events.findLast((event) => event.type === "result")
  const toolCalls = []
  let finalText = ""
  for (const event of events) {
    if (event.type !== "assistant") continue
    for (const block of event.message?.content ?? []) {
      if (block.type === "tool_use") {
        const input = block.input ?? {}
        toolCalls.push({
          name: block.name,
          target:
            input.file_path ?? input.path ?? input.pattern ?? input.command ?? input.skill ?? "",
        })
      }
      if (block.type === "text") finalText = block.text
    }
  }
  const skillReads = toolCalls
    .filter((call) => call.name === "Read" && /[\\/]\.claude[\\/]skills[\\/]/.test(call.target))
    .map((call) => call.target.replace(/^.*[\\/]\.claude[\\/]skills[\\/]/, "").replaceAll("\\", "/"))
  return {
    model: init?.model ?? null,
    skillsAvailable: init?.skills ?? null,
    skillInvoked: toolCalls.some((call) => call.name === "Skill"),
    skillReads,
    toolCounts: toolCalls.reduce((acc, call) => {
      acc[call.name] = (acc[call.name] ?? 0) + 1
      return acc
    }, {}),
    toolCalls,
    turns: result?.num_turns ?? null,
    durationMs: result?.duration_ms ?? null,
    costUsd: result?.total_cost_usd ?? null,
    usage: result?.usage ?? null,
    isError: result?.is_error ?? true,
    resultText: result?.result ?? finalText,
  }
}

// ---------------------------------------------------------------- checks

function typecheck(ws) {
  const out = spawnSync("npm run typecheck", {
    cwd: ws,
    shell: true,
    encoding: "utf8",
  })
  const text = `${out.stdout}\n${out.stderr}`
  const errors = text.split("\n").filter((line) => /error TS\d+/.test(line))
  return { ok: out.status === 0, errorCount: errors.length, errors: errors.slice(0, 20) }
}

// Runs the fixture's tests only when it defines a test script (write-feature-tests).
function tests(ws) {
  const pkg = readJson(join(ws, "package.json"), {})
  if (!pkg.scripts?.test) return undefined
  const out = spawnSync("npm test", { cwd: ws, shell: true, encoding: "utf8" })
  const text = `${out.stdout}\n${out.stderr}`
  const summary = text.split("\n").filter((line) => /^\s*(Test Files|Tests)\s/.test(line)).map((line) => line.trim())
  return { ok: out.status === 0, summary }
}

function staticChecks(files) {
  const counts = {
    propBags: 0,
    ternaryNull: 0,
    manualMemo: 0,
    globalStore: 0,
    cloneElement: 0,
    layerViolations: 0,
  }
  for (const [path, source] of Object.entries(files)) {
    if (!/\.(tsx?|jsx?)$/.test(path)) continue
    counts.propBags += (source.match(/\b(trigger|content|item|header|label|footer|list|title|input|menu)Props\??\s*[:=]/g) ?? []).length
    counts.ternaryNull += (source.match(/:\s*null\s*\}/g) ?? []).length
    counts.manualMemo += (source.match(/\b(useMemo|useCallback)\s*\(|\bmemo\s*\(/g) ?? []).length
    counts.globalStore += (source.match(/^(export\s+)?const\s+\w+\s*=\s*create\s*(<[^>]*>)?\s*\(/gm) ?? []).length
    counts.cloneElement += (source.match(/cloneElement\s*\(/g) ?? []).length
    if (/^src\/components\/(?!ui\/)/.test(path) && /from\s+["'](@\/features\/|\.\.\/features\/)/.test(source)) {
      counts.layerViolations += 1
    }
  }
  return counts
}

function collectChanges(ws, outDir) {
  git(ws, "add", "-A")
  const status = git(ws, "diff", "--cached", "--name-status", "HEAD").stdout
  const patch = git(ws, "diff", "--cached", "HEAD").stdout
  const changed = []
  const deleted = []
  for (const line of status.split("\n").filter(Boolean)) {
    const [code, ...rest] = line.split("\t")
    const path = rest.at(-1)
    if (code.startsWith("D")) deleted.push(path)
    else changed.push(path)
  }
  const files = {}
  for (const path of changed) {
    const source = readFileSync(join(ws, path), "utf8")
    files[path] = source
    mkdirSync(dirname(join(outDir, "output", path)), { recursive: true })
    writeFileSync(join(outDir, "output", path), source)
  }
  writeFileSync(join(outDir, "changes.patch"), patch)
  const added = (patch.match(/^\+(?!\+\+)/gm) ?? []).length
  const removed = (patch.match(/^-(?!--)/gm) ?? []).length
  return { changed, deleted, files, linesAdded: added, linesRemoved: removed }
}

// ---------------------------------------------------------------- agent mode
// The orchestrator runs subjects and graders as Claude Code subagents through
// the saved `skill-bench-iteration` workflow. This harness only prepares
// workspaces, collects results, and builds blind grading inputs.

function writeIterationMeta(iteration, tasks, variants, reps, note, mode, model = MODEL, effort = EFFORT) {
  const path = join(resultsDir, iteration, "iteration.json")
  const previous = readJson(path, {})
  if (previous.model && previous.model !== model) {
    throw new Error(`${iteration} already ran with ${previous.model}; use a new iteration id for ${model}`)
  }
  // One iteration may combine several prepare calls (different task and
  // variant sets), so the lists accumulate.
  const union = (a = [], b = []) => [...new Set([...a, ...b])]
  writeJson(path, {
    iteration,
    mode,
    model,
    effort,
    variants: union(previous.variants, variants),
    tasks: union(previous.tasks, tasks.map((task) => task.id)),
    reps: Math.max(previous.reps ?? 0, reps),
    note: note ?? previous.note ?? "",
    startedAt: previous.startedAt ?? new Date().toISOString(),
  })
}

function prepare(args) {
  const iteration = args.iteration
  if (!iteration) throw new Error("--iteration is required")
  const tasks = loadTasks(args.tasks)
  const variants = String(args.variants ?? "").split(",").filter(Boolean)
  const reps = Number(args.reps ?? 2)
  for (const variant of variants) variantSkillDir(variant)
  // The subject model is the thing under test; graders stay fixed so scores
  // remain comparable across models.
  const model = args.model ?? MODEL
  const effort = args.effort ?? EFFORT
  writeIterationMeta(iteration, tasks, variants, reps, args.note, "subagents", model, effort)

  const jobs = []
  for (let rep = 1; rep <= reps; rep++)
    for (const task of tasks)
      for (const variant of variants) {
        const runId = `${task.id}__${variant}__r${rep}`
        const done =
          existsSync(join(resultsDir, iteration, runId, "run.json")) && !args.force
        if (done) continue
        prepareWorkspace(task, variant, runId, iteration)
        rmSync(join(workRoot, iteration, `${runId}.report.md`), { force: true })
        jobs.push({ runId, task: task.id, variant })
      }
  const workflowArgs = {
    bench: fileURLToPath(import.meta.url).replaceAll("\\", "/"),
    workRoot: workRoot.replaceAll("\\", "/"),
    suite: suiteId,
    model,
    effort,
    iteration,
    skill: skillName,
    tasks: Object.fromEntries(tasks.map((task) => [task.id, task.prompt])),
    jobs,
  }
  writeJson(join(workRoot, iteration, "workflow-args.json"), workflowArgs)
  console.error(`${jobs.length} workspaces ready under ${join(workRoot, iteration)}`)
  console.log(JSON.stringify(workflowArgs))
}

function finalizeRun({ iteration, task, variant, rep, runId, ws, outDir, prompt, report, extra }) {
  const changes = collectChanges(ws, outDir)
  const checks = {
    typecheck: typecheck(ws),
    tests: tests(ws),
    static: staticChecks(changes.files),
    linesAdded: changes.linesAdded,
    linesRemoved: changes.linesRemoved,
    changed: changes.changed,
    deleted: changes.deleted,
  }
  writeFileSync(join(outDir, "REPORT.md"), report ?? "")
  const run = {
    runId,
    iteration,
    task,
    variant,
    rep,
    prompt,
    ...extra,
    checks,
  }
  writeJson(join(outDir, "run.json"), run)
  return run
}

function collect(args) {
  const iteration = args.iteration
  const runId = args.run
  if (!iteration || !runId) throw new Error("--iteration and --run are required")
  const [taskId, variant, repText] = runId.split("__")
  const task = loadTasks(taskId)[0]
  const ws = join(workRoot, iteration, runId)
  if (!existsSync(ws)) throw new Error(`No workspace at ${ws}`)
  const outDir = join(resultsDir, iteration, runId)
  // A graded run is evidence: never rebuild it from a workspace that may have
  // been touched since. Use regrade-prep to grade it again.
  if (existsSync(join(outDir, "grade.json")) && !args.force) {
    throw new Error(`${runId} is already graded; use regrade-prep, or --force to rebuild it`)
  }
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  const reportPath = join(workRoot, iteration, `${runId}.report.md`)
  const report = existsSync(reportPath) ? readFileSync(reportPath, "utf8") : ""
  const run = finalizeRun({
    iteration,
    task: taskId,
    variant,
    rep: Number(repText.slice(1)),
    runId,
    ws,
    outDir,
    prompt: promptFor(task, variant),
    report,
    extra: {
      mode: "subagents",
      model: readJson(join(resultsDir, iteration, "iteration.json"), {}).model ?? MODEL,
      effort: readJson(join(resultsDir, iteration, "iteration.json"), {}).effort ?? EFFORT,
      reportWritten: Boolean(report),
    },
  })

  const gradeId = randomBytes(6).toString("hex")
  const { dir } = buildGradeDir(task, outDir, join(workRoot, "grade", gradeId))
  const instructions = join(workRoot, "grade", `${gradeId}.instructions.md`)
  const out = join(workRoot, "grade", `${gradeId}.grade.json`)
  writeFileSync(
    instructions,
    `${graderPrompt(task, run.checks.typecheck, run.checks.tests)}\n\nGraded directory: ${dir}\nWrite the JSON result to: ${out}\n`
  )
  writeJson(join(workRoot, "grade", `${gradeId}.map.json`), { iteration, runId })
  run.gradeId = gradeId
  writeJson(join(outDir, "run.json"), run)
  console.log(
    JSON.stringify({ id: gradeId, gradeDir: dir.replaceAll("\\", "/"), instructions: instructions.replaceAll("\\", "/"), out: out.replaceAll("\\", "/") })
  )
}

// Builds a fresh blind grading input for an existing run against the task's
// current rubric, without touching the run's recorded results or metrics.
function regradePrep(args) {
  const iteration = args.iteration
  const runId = args.run
  if (!iteration || !runId) throw new Error("--iteration and --run are required")
  const outDir = join(resultsDir, iteration, runId)
  const run = readJson(join(outDir, "run.json"))
  const task = loadTasks(run.task)[0]
  const gradeId = randomBytes(6).toString("hex")
  const { dir } = buildGradeDir(task, outDir, join(workRoot, "grade", gradeId))
  const instructions = join(workRoot, "grade", `${gradeId}.instructions.md`)
  const out = join(workRoot, "grade", `${gradeId}.grade.json`)
  writeFileSync(
    instructions,
    `${graderPrompt(task, run.checks.typecheck, run.checks.tests)}\n\nGraded directory: ${dir}\nWrite the JSON result to: ${out}\n`
  )
  writeJson(join(workRoot, "grade", `${gradeId}.map.json`), { iteration, runId })
  run.previousGradeIds = [...(run.previousGradeIds ?? []), run.gradeId].filter(Boolean)
  run.gradeId = gradeId
  writeJson(join(outDir, "run.json"), run)
  if (existsSync(join(outDir, "grade.json"))) {
    cpSync(join(outDir, "grade.json"), join(outDir, `grade.rubric-v${readJson(join(outDir, "grade.json")).rubricVersion ?? 1}.json`))
    rmSync(join(outDir, "grade.json"))
  }
  console.log(
    JSON.stringify({ id: gradeId, gradeDir: dir.replaceAll("\\", "/"), instructions: instructions.replaceAll("\\", "/"), out: out.replaceAll("\\", "/") })
  )
}

function validateGrade(task, value) {
  if (!value || !Array.isArray(value.criteria)) return "missing criteria"
  for (const criterion of task.criteria) {
    const item = value.criteria.find((entry) => entry.id === criterion.id)
    if (!item) return `missing criterion ${criterion.id}`
    if (![0, 0.5, 1].includes(item.score)) return `bad score for ${criterion.id}`
  }
  if (!Number.isInteger(value.overall) || value.overall < 1 || value.overall > 10) return "bad overall"
  return null
}

function ingest(args) {
  const iteration = args.iteration
  const tasks = Object.fromEntries(loadTasks("all").map((task) => [task.id, task]))
  const iterDir = join(resultsDir, iteration)
  let saved = 0
  const problems = []
  for (const runId of readdirSync(iterDir)) {
    const runPath = join(iterDir, runId, "run.json")
    if (!existsSync(runPath)) continue
    if (existsSync(join(iterDir, runId, "grade.json")) && !args.force) continue
    const run = readJson(runPath)
    const out = run.gradeId && join(workRoot, "grade", `${run.gradeId}.grade.json`)
    if (!out || !existsSync(out)) {
      problems.push(`${runId}: no grade file`)
      continue
    }
    let value
    try {
      value = JSON.parse(readFileSync(out, "utf8"))
    } catch (error) {
      problems.push(`${runId}: invalid JSON (${error.message})`)
      continue
    }
    const task = tasks[run.task]
    const error = validateGrade(task, value)
    if (error) {
      problems.push(`${runId}: ${error}`)
      continue
    }
    value.score = weightedScore(task, value.criteria)
    value.rubricVersion = task.rubricVersion ?? 1
    value.grader = { mode: "subagent", model: GRADER_MODEL, effort: GRADER_EFFORT, at: new Date().toISOString() }
    writeJson(join(iterDir, runId, "grade.json"), value)
    saved++
  }
  console.log(`ingested ${saved} grades`)
  for (const problem of problems) console.log(`! ${problem}`)
}

// Subagent transcripts are Claude Code's internal JSONL format, so parsing is
// best-effort: unknown shapes are skipped rather than trusted.
function metrics(args) {
  const iteration = args.iteration
  const dir = args.dir
  if (!iteration || !dir) throw new Error("--iteration and --dir are required")
  const norm = (value) => String(value ?? "").replaceAll("\\", "/").toLowerCase()
  const iterRoot = norm(join(workRoot, iteration))
  const files = []
  const walk = (path) => {
    for (const name of readdirSync(path)) {
      const full = join(path, name)
      if (statSync(full).isDirectory()) walk(full)
      else if (name.endsWith(".jsonl")) files.push(full)
    }
  }
  walk(dir)
  let matched = 0
  for (const file of files) {
    const entries = readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line.startsWith("{"))
      .map((line) => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      })
      .filter(Boolean)
    const text = norm(JSON.stringify(entries.slice(0, 3)))
    const match = text.match(new RegExp(`project root: ${iterRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/([a-z0-9_-]+__[a-z0-9-]+__r\\d+)`))
    if (!match) continue
    const runPath = readdirSync(join(resultsDir, iteration))
      .map((id) => ({ id, path: join(resultsDir, iteration, id, "run.json") }))
      .find((entry) => entry.id.toLowerCase() === match[1])
    if (!runPath || !existsSync(runPath.path)) continue
    const root = `${iterRoot}/${match[1]}`
    // Transcript usage is written when a response starts streaming, so its
    // output_tokens are not final. Input-side tokens per request are exact
    // (they show how much context each call carried); output is measured as
    // characters of text and tool input the subject produced.
    const usage = { requests: 0, context_tokens: 0, output_chars: 0 }
    const seenRequests = new Set()
    const toolCalls = []
    const stamps = []
    for (const entry of entries) {
      if (entry.timestamp) stamps.push(Date.parse(entry.timestamp))
      const message = entry.message
      if (message?.role !== "assistant") continue
      const requestId = entry.requestId ?? entry.uuid
      if (!seenRequests.has(requestId)) {
        seenRequests.add(requestId)
        usage.requests += 1
        usage.context_tokens +=
          (message.usage?.input_tokens ?? 0) +
          (message.usage?.cache_read_input_tokens ?? 0) +
          (message.usage?.cache_creation_input_tokens ?? 0)
      }
      for (const block of Array.isArray(message.content) ? message.content : []) {
        if (block.type === "text") usage.output_chars += block.text?.length ?? 0
        if (block.type !== "tool_use") continue
        const input = block.input ?? {}
        usage.output_chars += JSON.stringify(input).length
        toolCalls.push({ name: block.name, target: input.file_path ?? input.path ?? input.pattern ?? input.command ?? "" })
      }
    }
    // Subjects read files with Read and with shell commands (cat, sed), so
    // both count. Paths under the harness's own tool-results spill are not
    // workspace escapes.
    const allowedOutside = (path) =>
      path.startsWith(root) || path.endsWith(".report.md") || path.includes("/tool-results/")
    const absolutePaths = (text) =>
      norm(text).match(/[a-z]:\/[^\s"'`;|&<>)]+|(?<![\w.])\/(?:c|users|tmp)\/[^\s"'`;|&<>)]+/g) ?? []
    const pathTools = new Set(["Read", "Write", "Edit", "Glob", "Grep"])
    const outsideRoot = toolCalls.filter((call) => {
      if (pathTools.has(call.name)) {
        return /^[a-z]:|^\//i.test(String(call.target)) && !allowedOutside(norm(call.target))
      }
      if (call.name === "Bash") return absolutePaths(call.target).some((path) => !allowedOutside(path))
      return false
    })
    // Shell reads also come as loops and globs (`for f in references/*.md`),
    // so any references/ or examples/ token in a command that touches the
    // installed skill counts, and a glob counts as reading every match.
    const skillReads = [
      ...new Set(
        toolCalls.flatMap((call) => {
          const text = norm(call.target)
          if (call.name === "Read") {
            return text.includes(".claude/skills/") ? [text.replace(/^.*\.claude\/skills\//, "")] : []
          }
          if (call.name !== "Bash" || !text.includes(".claude/skills")) return []
          const direct = (text.match(/\.claude\/skills\/[^\s"'`;|&<>)]+/g) ?? []).map((path) =>
            path.replace(/^\.claude\/skills\//, "")
          )
          const relative = (text.match(/(?:^|[\s"'/])((?:references|examples)\/[^\s"'`;|&<>)]+)/g) ?? []).map(
            (token) => `${skillName}/${token.trim().replace(/^["'/]/, "")}`
          )
          return [...direct, ...relative]
        })
      ),
    ].filter((path) => /\.(md|tsx?)$/.test(path) || path.endsWith("/") || path.includes("*"))
    const run = readJson(runPath.path)
    const models = [...new Set(entries.map((entry) => entry.message?.role === "assistant" && entry.message.model).filter(Boolean))]
    Object.assign(run, {
      modelActual: models.join(","),
      usage,
      wallMs: stamps.length ? Math.max(...stamps) - Math.min(...stamps) : run.wallMs ?? null,
      turns: usage.requests,
      skillReads,
      skillInvoked: skillReads.some((path) => path.endsWith("skill.md")),
      toolCounts: toolCalls.reduce((acc, call) => ((acc[call.name] = (acc[call.name] ?? 0) + 1), acc), {}),
      outsideRoot: outsideRoot.map((call) => `${call.name} ${call.target}`).slice(0, 20),
      transcript: file,
    })
    writeJson(runPath.path, run)
    matched++
  }
  console.log(`metrics merged for ${matched} runs from ${files.length} transcripts`)
}

// ---------------------------------------------------------------- pairwise (blind A/B)
// When a rubric saturates, absolute scores stop separating variants. A blind
// pairwise judge compares two end states of the same task against the owner's
// quality bar; the A/B order is random and recorded only in a map file.

const QUALITY_BAR = [
  "Layering: generic parts carry no product code; queries, mutations, and product rules live in the feature.",
  "Reuse: nothing written twice; record anatomy composed once in the owning feature; generic components in components/ui named by role.",
  "Design-system fidelity: typed size/variant APIs, primitives extended through their variant definitions, call-site className only for layout.",
  "Composability: parts open to composition (slots, children), no prop bags or boolean switchboards.",
  "Correctness: behavior, accessibility, and types hold, including edge and failure paths.",
  "Simplicity: the least machinery that meets the request; no speculative parts.",
]
const REVIEW_BAR = [
  "Accuracy: real defects found, no false positives or invented requirements.",
  "Judgment: what to keep, remove, or revisit is right and justified.",
  "Actionability: each finding has a concrete correction and a location.",
  "Prioritization: the most harmful issues come first.",
]

function pairPrepAll(args) {
  const [aIteration, aVariant] = String(args.a ?? "").split(":")
  const [bIteration, bVariant] = String(args.b ?? "").split(":")
  if (!aVariant || !bVariant) throw new Error("--a and --b take <iteration>:<variant>")
  const label = args.label ?? `${aVariant}-vs-${bVariant}`
  const tasks = loadTasks(args.tasks)
  const jobs = []
  for (const task of tasks) {
    for (let rep = 1; rep <= Number(args.reps ?? 2); rep++) {
      const runA = join(resultsDir, aIteration, `${task.id}__${aVariant}__r${rep}`)
      const runB = join(resultsDir, bIteration, `${task.id}__${bVariant}__r${rep}`)
      if (!existsSync(join(runA, "run.json")) || !existsSync(join(runB, "run.json"))) continue
      const id = randomBytes(6).toString("hex")
      const dir = join(workRoot, "pairs", id)
      rmSync(dir, { recursive: true, force: true })
      const aFirst = randomBytes(1)[0] % 2 === 0
      buildGradeDir(task, aFirst ? runA : runB, join(dir, "A"))
      buildGradeDir(task, aFirst ? runB : runA, join(dir, "B"))
      const bar = task.mode === "audit" ? REVIEW_BAR : QUALITY_BAR
      const instructions = join(workRoot, "pairs", `${id}.instructions.md`)
      const out = join(workRoot, "pairs", `${id}.verdict.json`)
      writeFileSync(
        instructions,
        `Task given to both engineers:\n"""\n${task.prompt}\n"""\n\nQuality goals (judge each):\n${bar.map((goal) => `- ${goal}`).join("\n")}\n\nCompared directory: ${dir}\nWrite the JSON verdict to: ${out}\n`
      )
      writeJson(join(workRoot, "pairs", `${id}.map.json`), {
        suite: suiteId,
        label,
        task: task.id,
        rep,
        A: aFirst ? { iteration: aIteration, variant: aVariant } : { iteration: bIteration, variant: bVariant },
        B: aFirst ? { iteration: bIteration, variant: bVariant } : { iteration: aIteration, variant: aVariant },
      })
      jobs.push({ id, dir: dir.replaceAll("\\", "/"), instructions: instructions.replaceAll("\\", "/"), out: out.replaceAll("\\", "/") })
    }
  }
  writeJson(join(workRoot, "pairs", `${label}.jobs.json`), jobs)
  console.error(`${jobs.length} pairs prepared for ${label}`)
  console.log(JSON.stringify(jobs))
}

function pairIngest(args) {
  const label = args.label
  if (!label) throw new Error("--label is required")
  const jobs = readJson(join(workRoot, "pairs", `${label}.jobs.json`), [])
  // Judges that return structured output instead of writing files: recover
  // each verdict from the workflow journal (label "judge <pair id>").
  if (typeof args.journal === "string") {
    const lines = readFileSync(args.journal, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
    const labelOf = Object.fromEntries(lines.filter((entry) => entry.type === "started").map((entry) => [entry.agentId, entry.label]))
    for (const entry of lines.filter((item) => item.type === "result")) {
      const pairId = String(labelOf[entry.agentId] ?? "").replace(/^judge\s+/, "")
      const job = jobs.find((item) => item.id === pairId)
      if (!job || existsSync(job.out)) continue
      const value = typeof entry.result === "string" ? JSON.parse(entry.result) : entry.result
      if (value && value.winner) writeJson(job.out, value)
    }
  }
  const verdicts = []
  for (const job of jobs) {
    const map = readJson(join(workRoot, "pairs", `${job.id}.map.json`))
    const verdict = readJson(job.out, null)
    if (!verdict) {
      console.log(`! ${job.id}: no verdict`)
      continue
    }
    const resolve = (side) => (side === "A" || side === "B" ? map[side].variant : "tie")
    verdicts.push({
      task: map.task,
      rep: map.rep,
      winner: resolve(verdict.winner),
      margin: verdict.margin,
      goals: (verdict.goals ?? []).map((goal) => ({ goal: goal.goal, winner: resolve(goal.winner), evidence: goal.evidence })),
      summary: verdict.summary,
    })
  }
  const tally = verdicts.reduce((acc, v) => ((acc[v.winner] = (acc[v.winner] ?? 0) + 1), acc), {})
  writeJson(join(resultsDir, "pairs", `${label}.json`), { label, at: new Date().toISOString(), tally, verdicts })
  console.log(`${label}: ${JSON.stringify(tally)} (${verdicts.length} pairs)`)
}

// ---------------------------------------------------------------- run (headless CLI mode)

async function run(args) {
  const iteration = args.iteration
  if (!iteration) throw new Error("--iteration is required")
  const tasks = loadTasks(args.tasks)
  const variants = String(args.variants ?? "").split(",").filter(Boolean)
  const reps = Number(args.reps ?? 2)
  const concurrency = Number(args.concurrency ?? 4)
  for (const variant of variants) variantSkillDir(variant)

  const jobs = []
  for (let rep = 1; rep <= reps; rep++)
    for (const task of tasks)
      for (const variant of variants)
        jobs.push({ task, variant, rep, runId: `${task.id}__${variant}__r${rep}` })

  const pending = jobs.filter(
    (job) => args.force || !existsSync(join(resultsDir, iteration, job.runId, "run.json"))
  )
  writeJson(join(resultsDir, iteration, "iteration.json"), {
    iteration,
    model: MODEL,
    effort: EFFORT,
    variants,
    tasks: tasks.map((task) => task.id),
    reps,
    note: args.note ?? readJson(join(resultsDir, iteration, "iteration.json"), {}).note ?? "",
    startedAt: new Date().toISOString(),
  })
  console.log(`${pending.length}/${jobs.length} runs pending, concurrency ${concurrency}`)

  await pool(pending, concurrency, async (job) => {
    const outDir = join(resultsDir, iteration, job.runId)
    rmSync(outDir, { recursive: true, force: true })
    mkdirSync(outDir, { recursive: true })
    const ws = prepareWorkspace(job.task, job.variant, job.runId, iteration)
    const prompt = promptFor(job.task, job.variant)
    console.log(`▶ ${job.runId}`)
    const response = await runClaude(
      [
        "-p", prompt,
        "--model", MODEL,
        "--effort", EFFORT,
        "--output-format", "stream-json",
        "--verbose",
        "--setting-sources", "project",
        "--no-session-persistence",
        "--permission-mode", "acceptEdits",
        "--permission-prompts", "none",
        "--allowedTools", "Bash(npm run typecheck)", "Skill",
        "--disallowedTools", "WebFetch", "WebSearch", "Agent",
      ],
      ws,
      join(outDir, "transcript.jsonl")
    )
    const transcript = summarizeTranscript(response.stdout)
    const changes = collectChanges(ws, outDir)
    const checks = {
      typecheck: typecheck(ws),
      static: staticChecks(changes.files),
      linesAdded: changes.linesAdded,
      linesRemoved: changes.linesRemoved,
      changed: changes.changed,
      deleted: changes.deleted,
    }
    writeFileSync(join(outDir, "REPORT.md"), transcript.resultText ?? "")
    const { toolCalls, resultText, ...summary } = transcript
    writeJson(join(outDir, "run.json"), {
      runId: job.runId,
      iteration,
      task: job.task.id,
      variant: job.variant,
      rep: job.rep,
      prompt,
      exitCode: response.code,
      stderr: response.stderr.slice(-2000),
      wallMs: response.ms,
      ...summary,
      toolCalls,
      checks,
    })
    console.log(
      `✔ ${job.runId}  ${(response.ms / 60000).toFixed(1)}m  typecheck=${checks.typecheck.ok}  skillReads=${summary.skillReads.length}`
    )
  })
}

// ---------------------------------------------------------------- grade

const gradeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["criteria", "overall", "strengths", "problems", "beyond"],
  properties: {
    criteria: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "score", "na", "evidence"],
        properties: {
          id: { type: "string" },
          score: { type: "number", enum: [0, 0.5, 1] },
          na: { type: "boolean" },
          evidence: { type: "string" },
        },
      },
    },
    overall: { type: "integer", minimum: 1, maximum: 10 },
    strengths: { type: "array", items: { type: "string" } },
    problems: { type: "array", items: { type: "string" } },
    beyond: { type: "string" },
  },
}

function graderPrompt(task, typecheckResult, testsResult) {
  const testsLine = testsResult
    ? ` The harness test run (npm test): ${testsResult.ok ? "PASSED" : "FAILED"}${testsResult.summary?.length ? ` (${testsResult.summary.join("; ")})` : ""}.`
    : ""
  const rubric = task.criteria
    .map((criterion) => `- ${criterion.id} (weight ${criterion.weight}): ${criterion.text}`)
    .join("\n")
  return `You are a strict senior React reviewer grading one engineer's attempt at a task in this repository.

The task they were given:
"""
${task.prompt}
"""

Files in this directory are the END state of their work. CHANGES.patch shows everything they changed relative to the starting project (empty means no edits). REPORT.md is their final message to the user; for review tasks it is the main deliverable. The harness typecheck result: ${typecheckResult.ok ? "PASSED" : `FAILED with ${typecheckResult.errorCount} errors`}.${testsLine}

Read the changed code and the code it interacts with before scoring. Score every rubric criterion below: 1 = fully satisfied, 0.5 = partially, 0 = not satisfied or wrong. Set na=true (score 0) only when a criterion genuinely cannot apply to this solution; explain why. Evidence must cite files/lines or quote REPORT.md. Judge what was built, not what was claimed.

Rubric:
${rubric}

Then give "overall": a 1-10 senior-reviewer score for correctness, API design, and maintainability; up to 5 "strengths"; up to 5 "problems"; and "beyond": anything valuable they did that the rubric does not cover (or "").`
}

function buildGradeDir(task, runDir, dir = join(workRoot, "grade", randomBytes(6).toString("hex"))) {
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  copyTree(fixtureDir, dir)
  if (existsSync(join(task.dir, "files"))) copyTree(join(task.dir, "files"), dir)
  const run = readJson(join(runDir, "run.json"))
  for (const path of run.checks.deleted) rmSync(join(dir, path), { force: true })
  if (existsSync(join(runDir, "output"))) copyTree(join(runDir, "output"), dir)
  cpSync(join(runDir, "changes.patch"), join(dir, "CHANGES.patch"))
  cpSync(join(runDir, "REPORT.md"), join(dir, "REPORT.md"))
  rmSync(join(dir, "package-lock.json"), { force: true })
  return { dir, run }
}

async function grade(args) {
  const iteration = args.iteration
  const concurrency = Number(args.concurrency ?? 4)
  const tasks = Object.fromEntries(loadTasks("all").map((task) => [task.id, task]))
  const iterDir = join(resultsDir, iteration)
  const runIds = readdirSync(iterDir).filter(
    (id) =>
      existsSync(join(iterDir, id, "run.json")) &&
      (args.force || !existsSync(join(iterDir, id, "grade.json")))
  )
  console.log(`${runIds.length} runs to grade`)
  await pool(runIds, concurrency, async (runId) => {
    const runDir = join(iterDir, runId)
    const { dir, run } = buildGradeDir(tasks[run.task], runDir)
    const task = tasks[run.task]
    const response = await runClaude(
      [
        "-p", graderPrompt(task, run.checks.typecheck, run.checks.tests),
        "--model", GRADER_MODEL,
        "--effort", GRADER_EFFORT,
        "--output-format", "json",
        "--setting-sources", "project",
        "--no-session-persistence",
        "--permission-prompts", "none",
        "--tools", "Read,Glob,Grep",
        "--json-schema", JSON.stringify(gradeSchema),
      ],
      dir,
      null
    )
    let parsed = null
    try {
      const envelope = JSON.parse(response.stdout)
      parsed = envelope.structured_output ?? JSON.parse(envelope.result)
      parsed.costUsd = envelope.total_cost_usd ?? null
    } catch (error) {
      console.log(`✖ grade ${runId}: ${error.message}\n${response.stdout.slice(0, 500)}${response.stderr.slice(0, 500)}`)
      return
    }
    parsed.score = weightedScore(task, parsed.criteria)
    parsed.grader = { model: GRADER_MODEL, effort: GRADER_EFFORT, at: new Date().toISOString() }
    writeJson(join(runDir, "grade.json"), parsed)
    rmSync(dir, { recursive: true, force: true })
    console.log(`✔ graded ${runId}: ${parsed.score.toFixed(1)} (overall ${parsed.overall})`)
  })
}

function weightedScore(task, criteria) {
  let total = 0
  let weight = 0
  for (const criterion of task.criteria) {
    const result = criteria.find((item) => item.id === criterion.id)
    if (!result || result.na) continue
    total += criterion.weight * result.score
    weight += criterion.weight
  }
  return weight ? (100 * total) / weight : 0
}

// ---------------------------------------------------------------- report

function report() {
  const tasks = loadTasks("all")
  const iterations = existsSync(resultsDir)
    ? readdirSync(resultsDir).filter((id) => existsSync(join(resultsDir, id, "iteration.json")))
    : []
  const variantMeta = Object.fromEntries(
    (existsSync(variantsDir) ? readdirSync(variantsDir) : [])
      .filter((file) => file.endsWith(".meta.json"))
      .map((file) => [file.replace(".meta.json", ""), readJson(join(variantsDir, file))])
  )
  const data = {
    generatedAt: new Date().toISOString(),
    skill: skillName,
    tasks: tasks.map(({ dir, ...task }) => task),
    variants: variantMeta,
    iterations: iterations.map((iteration) => {
      const iterDir = join(resultsDir, iteration)
      const runs = readdirSync(iterDir)
        .filter((id) => existsSync(join(iterDir, id, "run.json")))
        .map((id) => {
          const run = readJson(join(iterDir, id, "run.json"))
          const gradeResult = readJson(join(iterDir, id, "grade.json"), null)
          const output = Object.fromEntries(
            listFiles(join(iterDir, id, "output")).map((path) => [
              path,
              readFileSync(join(iterDir, id, "output", path), "utf8"),
            ])
          )
          const { toolCalls, stderr, prompt, ...rest } = run
          return {
            ...rest,
            report: readFileSync(join(iterDir, id, "REPORT.md"), "utf8"),
            output,
            grade: gradeResult,
          }
        })
      return { ...readJson(join(iterDir, "iteration.json")), runs }
    }),
  }
  // Structural consistency between repetitions of the same variant and task:
  // how much the changed file paths and exported names overlap (Jaccard,
  // averaged over every pair of runs). Mechanical, no grader involved.
  const jaccard = (a, b) => {
    const union = new Set([...a, ...b])
    if (!union.size) return 1
    return [...a].filter((x) => b.has(x)).length / union.size
  }
  const exportsOf = (output) =>
    new Set(
      Object.values(output ?? {}).flatMap((source) => [
        ...[...source.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z_]\w*)/g)].map((m) => m[1]),
        ...[...source.matchAll(/export\s*\{([^}]*)\}/g)].flatMap((m) =>
          m[1].split(",").map((name) => name.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()).filter(Boolean)
        ),
      ])
    )
  const allRuns = data.iterations.flatMap((iteration) => iteration.runs)
  data.consistency = []
  for (const task of data.tasks) {
    for (const variant of [...new Set(allRuns.map((run) => run.variant))]) {
      const runs = allRuns.filter((run) => run.task === task.id && run.variant === variant)
      if (runs.length < 2 || task.mode === "audit") continue
      const pairs = []
      for (let i = 0; i < runs.length; i++)
        for (let j = i + 1; j < runs.length; j++) {
          const files = jaccard(new Set(Object.keys(runs[i].output ?? {})), new Set(Object.keys(runs[j].output ?? {})))
          const names = jaccard(exportsOf(runs[i].output), exportsOf(runs[j].output))
          pairs.push({ files, names })
        }
      const mean = (values) => values.reduce((a, b) => a + b, 0) / values.length
      const files = mean(pairs.map((pair) => pair.files))
      const names = mean(pairs.map((pair) => pair.names))
      data.consistency.push({ task: task.id, variant, runs: runs.length, files, names, score: (files + names) / 2 })
    }
  }

  // Starting content of every file a run changed, so the dashboard can show
  // each run's version next to the original.
  for (const task of data.tasks) {
    const paths = new Set(
      data.iterations.flatMap((iteration) =>
        iteration.runs.filter((run) => run.task === task.id).flatMap((run) => Object.keys(run.output ?? {}))
      )
    )
    task.baseFiles = {}
    for (const path of paths) {
      const overlay = join(tasksDir, task.id, "files", path)
      const fixture = join(fixtureDir, path)
      const source = existsSync(overlay) ? overlay : existsSync(fixture) ? fixture : null
      if (source) task.baseFiles[path] = readFileSync(source, "utf8")
    }
  }
  const pairsDir = join(resultsDir, "pairs")
  data.pairs = existsSync(pairsDir) ? readdirSync(pairsDir).filter((file) => file.endsWith(".json")).map((file) => readJson(join(pairsDir, file))) : []
  data.suite = { id: suiteId, ...readJson(join(suiteDir, "suite.json"), {}) }
  // Skill text per variant (markdown only), for the before/after text view.
  data.variantFiles = Object.fromEntries(
    (existsSync(variantsDir) ? readdirSync(variantsDir) : [])
      .filter((id) => existsSync(join(variantsDir, id, "SKILL.md")))
      .map((id) => [id, Object.fromEntries(listFiles(join(variantsDir, id)).filter((path) => path.endsWith(".md")).map((path) => [path, readFileSync(join(variantsDir, id, path), "utf8")]))])
  )
  writeJson(join(dashboardDir, "data", `${suiteId}.json`), data)

  // Catalog index: one summary row per suite, so the dashboard can list every skill.
  const indexPath = join(dashboardDir, "data", "index.json")
  const index = readJson(indexPath, { suites: [] })
  const graded = data.iterations.flatMap((iteration) => iteration.runs).filter((run) => run.grade)
  const meanOf = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null)
  const variantSummary = Object.fromEntries(
    [...new Set(graded.map((run) => run.variant))].map((variant) => {
      const runs = graded.filter((run) => run.variant === variant)
      const taskIds = [...new Set(runs.map((run) => run.task))]
      return [variant, {
        words: variant === "none" ? 0 : data.variants[variant]?.words?.total ?? null,
        score: meanOf(taskIds.map((task) => meanOf(runs.filter((run) => run.task === task).map((run) => run.grade.score)))),
        tasks: taskIds.length,
        runs: runs.length,
        models: [...new Set(runs.map((run) => run.model).filter(Boolean))],
      }]
    })
  )
  const row = {
    id: suiteId,
    title: data.suite.title ?? suiteId,
    skill: skillName,
    generatedAt: data.generatedAt,
    variants: variantSummary,
    variantWords: Object.fromEntries(Object.entries(data.variants).map(([id, meta]) => [id, meta.words?.total ?? null])),
    tasks: data.tasks.length,
    iterations: data.iterations.length,
    models: [...new Set(data.iterations.map((iteration) => iteration.model).filter(Boolean))],
    promoted: data.suite.promoted ?? null,
  }
  index.suites = [...index.suites.filter((suite) => suite.id !== row.id), row].sort((a, b) => a.id.localeCompare(b.id))
  writeJson(indexPath, index)
  const lines = []
  for (const iteration of data.iterations) {
    lines.push(`\n## ${iteration.iteration} ${iteration.note ? `— ${iteration.note}` : ""}`)
    const byVariant = {}
    for (const run of iteration.runs) {
      ;(byVariant[run.variant] ??= []).push(run)
    }
    for (const [variant, runs] of Object.entries(byVariant)) {
      const graded = runs.filter((run) => run.grade)
      const mean = (values) => values.reduce((a, b) => a + b, 0) / (values.length || 1)
      lines.push(
        `${variant.padEnd(12)} score ${mean(graded.map((run) => run.grade.score)).toFixed(1).padStart(5)}  overall ${mean(graded.map((run) => run.grade.overall)).toFixed(1)}  typecheck ${runs.filter((run) => run.checks.typecheck.ok).length}/${runs.length}  minutes ${mean(runs.map((run) => run.wallMs / 60000)).toFixed(1)}  context-tokens ${Math.round(mean(runs.map((run) => run.usage?.context_tokens ?? 0)))}  graded ${graded.length}/${runs.length}`
      )
    }
  }
  console.log(lines.join("\n"))
}

// ---------------------------------------------------------------- main

const args = parseArgs(process.argv.slice(2))
useSuite(typeof args.suite === "string" ? args.suite : "build-composable-components")
if (typeof args["work-root"] === "string") workRoot = resolve(args["work-root"])
// Suites reuse iteration names (it0, it1), so each gets its own workspace root.
// Workflows pass the nested root back, so nesting is idempotent.
if (basename(workRoot) !== suiteId) workRoot = join(workRoot, suiteId)
const command = args._[0]
const commands = { snapshot, prepare, collect, "regrade-prep": regradePrep, ingest, metrics, report, "pair-prep-all": pairPrepAll, "pair-ingest": pairIngest, run, grade }
if (!commands[command]) {
  console.log(
    "Usage: bench <snapshot|prepare|collect|ingest|metrics|report|run|grade> [--work-root <dir>] [options]"
  )
  process.exit(1)
}
await commands[command](args)
