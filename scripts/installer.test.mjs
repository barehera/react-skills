import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import test from "node:test"

import { adapterAgents, agentItemName, agents } from "../bin/install-targets.mjs"
import {
  catalogSkills,
  detectAgents,
  findExistingTargets,
  findInstalledSkills,
  findPruneCandidates,
  installFiles,
  installLayout,
  mergeExcludeBlock,
  parseArguments,
  planFiles,
  projectPaths,
  readCatalog,
  readInstallState,
  removeFiles,
  resolveSkills,
  writeInstallState,
} from "../bin/installer.mjs"

const root = resolve(import.meta.dirname, "..")

async function withProject(run) {
  const cwd = await mkdtemp(join(tmpdir(), "react-skills-"))

  try {
    await run(cwd)
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
}

async function put(cwd, path, content = "") {
  await mkdir(dirname(join(cwd, path)), { recursive: true })
  await writeFile(join(cwd, path), content)
}

test("arguments select a command, skills, agents, and flags", () => {
  const options = parseArguments(
    ["build-forms,manage-server-state", "--agent", "cursor", "-a", "claude,cursor", "--prune", "--dry-run"],
    "/project",
  )

  assert.equal(options.command, "install")
  assert.deepEqual(options.skillNames, ["build-forms", "manage-server-state"])
  assert.deepEqual(options.agentIds, ["cursor", "claude"])
  assert.equal(options.prune, true)
  assert.equal(options.dryRun, true)
  assert.equal(parseArguments(["update"]).command, "update")
  assert.equal(parseArguments(["--list"]).command, "list")
  assert.throws(() => parseArguments(["--agent", "vscode"]), /Unknown agent: vscode/)
  assert.throws(() => parseArguments(["--agent"]), /requires a value/)
  assert.throws(() => parseArguments(["--ref", "main"]), /Unknown option/)
  assert.equal(parseArguments(["--global"]).global, true)
  assert.deepEqual(parseArguments(["-g", "--agent", "claude"]).agentIds, ["claude"])
  assert.throws(() => parseArguments(["--global", "--agent", "cursor"]), /Claude Code only/)
})

test("the catalog lists skills, and every skill has one item per adapter agent", async () => {
  const items = await readCatalog(resolve(root, "registry.json"))
  const skills = catalogSkills(items)
  const names = new Set(items.map((item) => item.name))

  assert.ok(skills.length > 0)
  assert.ok(skills.every((skill) => skill.meta?.agent === undefined))

  for (const skill of skills) {
    for (const agent of adapterAgents) {
      assert.ok(names.has(agentItemName(skill.name, agent.id)), `${skill.name} for ${agent.id}`)
    }
  }

  assert.deepEqual(resolveSkills(["1", skills[0].name], skills), [skills[0].name])
  assert.throws(() => resolveSkills(["missing-skill"], skills), /Unknown skill: missing-skill/)
})

test("a plan copies each skill once plus only the selected agents' pointers", async () => {
  const items = await readCatalog(resolve(root, "registry.json"))
  const targets = (plan) => plan.map((file) => file.target)
  const cursorPlan = planFiles(["build-forms"], ["cursor"], items)

  assert.ok(targets(cursorPlan).includes(".agents/skills/build-forms/SKILL.md"))
  assert.ok(targets(cursorPlan).includes(".agents/skills/VERSION"))
  assert.ok(targets(cursorPlan).includes(".cursor/rules/build-forms.mdc"))
  assert.ok(!targets(cursorPlan).some((target) => target.startsWith(".claude/")))
  assert.ok(cursorPlan.every((file) => existsSync(file.source)), "every source file exists")
  assert.equal(
    cursorPlan.find((file) => file.target === ".cursor/rules/build-forms.mdc").source,
    resolve(root, "skills/build-forms/adapters/cursor.mdc"),
  )

  const codexPlan = planFiles(["build-forms"], ["codex"], items)

  assert.ok(targets(codexPlan).every((target) => target.startsWith(".agents/skills/")))
  assert.equal(
    targets(planFiles(["build-forms", "manage-server-state"], ["claude"], items))
      .filter((target) => target === ".agents/skills/VERSION").length,
    1,
  )
})

test("a global plan puts the canonical skill where Claude Code reads it, without pointers", async () => {
  const items = await readCatalog(resolve(root, "registry.json"))
  const plan = planFiles(["build-forms"], ["claude"], items, installLayout(true))
  const targets = plan.map((file) => file.target)

  assert.ok(targets.includes(".claude/skills/build-forms/SKILL.md"))
  assert.ok(targets.includes(".claude/skills/build-forms/references/architecture.md"))
  assert.ok(targets.includes(".claude/skills/VERSION"))
  assert.ok(targets.every((target) => target.startsWith(".claude/skills/")))
  assert.equal(
    plan.find((file) => file.target === ".claude/skills/build-forms/SKILL.md").source,
    resolve(root, "skills/build-forms/SKILL.md"),
  )
})

test("installing copies files, keeps existing ones unless replacing, and clears stale skill files", async () => {
  await withProject(async (cwd) => {
    const source = join(cwd, "source")
    const project = join(cwd, "project")
    const layout = installLayout(false)
    const plan = [
      { source: join(source, "SKILL.md"), target: ".agents/skills/a/SKILL.md" },
      { source: join(source, "pointer.md"), target: ".claude/skills/a/SKILL.md" },
    ]

    await put(source, "SKILL.md", "v2 skill")
    await put(source, "pointer.md", "v2 pointer")
    await put(project, ".agents/skills/a/SKILL.md", "my edit")
    await put(project, ".agents/skills/a/references/removed.md", "old")

    assert.deepEqual(await installFiles(project, plan, layout, ["a"], false), {
      written: 1,
      kept: [".agents/skills/a/SKILL.md"],
    })
    assert.equal(await readFile(join(project, ".agents/skills/a/SKILL.md"), "utf8"), "my edit")

    assert.deepEqual(await installFiles(project, plan, layout, ["a"], true), { written: 2, kept: [] })
    assert.equal(await readFile(join(project, ".agents/skills/a/SKILL.md"), "utf8"), "v2 skill")
    assert.equal(existsSync(join(project, ".agents/skills/a/references/removed.md")), false)
  })
})

test("the git exclude block lists every React Skills path and replaces itself", () => {
  const paths = projectPaths(["a"])

  assert.ok(paths.includes(".agents/skills/a/"))
  assert.ok(paths.includes(".agents/skills/VERSION"))
  assert.ok(paths.includes(".agents/skills/react-skills.json"))

  for (const agent of adapterAgents) {
    assert.ok(paths.includes(agent.targetPath("a")), agent.id)
  }

  const userRules = "# git ls-files --others --exclude-from=.git/info/exclude\n*.local\n"
  const once = mergeExcludeBlock(userRules, ["/.agents/skills/a/"])
  const twice = mergeExcludeBlock(once, ["/.agents/skills/a/", "/.agents/skills/b/"])

  assert.equal(
    once,
    `${userRules}\n# >>> React Skills: installed for this clone only\n/.agents/skills/a/\n# <<< React Skills\n`,
  )
  assert.equal(twice.match(/# >>> React Skills/g).length, 1)
  assert.ok(twice.includes("/.agents/skills/b/"))
  assert.ok(twice.includes("*.local"))
  assert.equal(mergeExcludeBlock(twice, []), userRules)
  assert.equal(
    mergeExcludeBlock(once.replaceAll("\n", "\r\n"), ["/x/"]).match(/# >>> React Skills/g).length,
    1,
  )
})

test("agents are detected from their project folders", async () => {
  await withProject(async (cwd) => {
    assert.deepEqual(await detectAgents(cwd), [])
    await put(cwd, ".cursor/rules/team.mdc", "Use tabs.")
    await put(cwd, ".github/workflows/ci.yml")
    assert.deepEqual(await detectAgents(cwd), ["cursor"])
    await put(cwd, ".github/copilot-instructions.md")
    assert.deepEqual(await detectAgents(cwd), ["cursor", "copilot"])
  })
})

test("folders holding only React Skills pointers do not count as an agent", async () => {
  await withProject(async (cwd) => {
    const pointer = "Read and follow `.agents/skills/a/SKILL.md`, and the references."

    await put(cwd, ".windsurf/rules/a.md", pointer)
    await put(cwd, ".claude/skills/a/SKILL.md", pointer)
    await put(cwd, ".github/instructions/a.instructions.md", pointer)
    assert.deepEqual(await detectAgents(cwd), [])
    await put(cwd, ".claude/settings.json", "{}")
    assert.deepEqual(await detectAgents(cwd), ["claude"])
  })
})

test("install state round-trips per layout and ignores unknown agents", async () => {
  await withProject(async (cwd) => {
    assert.equal(await readInstallState(cwd), null)
    await writeInstallState(cwd, {
      version: "1.2.3",
      skills: ["b", "a", "a"],
      agents: ["windsurf", "claude"],
    })
    assert.deepEqual(await readInstallState(cwd), {
      version: "1.2.3",
      skills: ["a", "b"],
      agents: ["claude", "windsurf"],
    })
    await put(cwd, ".agents/skills/react-skills.json", '{"skills":["a"],"agents":["claude","vim"]}')
    assert.deepEqual((await readInstallState(cwd)).agents, ["claude"])
    assert.equal(await readInstallState(cwd, installLayout(true)), null)
    await writeInstallState(cwd, { version: "1.2.3", skills: ["a"], agents: ["claude"] }, installLayout(true))
    assert.ok(existsSync(join(cwd, ".claude/skills/react-skills.json")))
  })
})

test("existing targets and installed skills come from the install root", async () => {
  await withProject(async (cwd) => {
    const skills = [{ name: "a" }, { name: "b" }]
    const plan = ["a", "b"].flatMap((name) => [
      { target: `.agents/skills/${name}/SKILL.md` },
      { target: `.cursor/rules/${name}.mdc` },
    ])

    await put(cwd, ".agents/skills/a/SKILL.md")
    await put(cwd, ".cursor/rules/a.mdc")
    await put(cwd, ".windsurf/rules/a.md")
    await put(cwd, ".claude/skills/b/SKILL.md")

    assert.deepEqual(findInstalledSkills(cwd, skills), ["a"])
    assert.deepEqual(findInstalledSkills(cwd, skills, installLayout(true)), ["b"])
    assert.deepEqual(findExistingTargets(cwd, plan), [
      ".agents/skills/a/SKILL.md",
      ".cursor/rules/a.mdc",
    ])
  })
})

test("pruning removes only generated pointers for unselected agents", async () => {
  await withProject(async (cwd) => {
    const pointer = "Read and follow `.agents/skills/a/SKILL.md`."

    await put(cwd, ".cursor/rules/a.mdc", pointer)
    await put(cwd, ".windsurf/rules/a.md", pointer)
    await put(cwd, ".claude/skills/a/SKILL.md", pointer)
    await put(cwd, ".github/instructions/a.instructions.md", "Hand-written team rule")
    await put(cwd, ".github/workflows/ci.yml")

    const candidates = await findPruneCandidates(cwd, ["a"], ["cursor"])

    assert.deepEqual(
      candidates.map((candidate) => candidate.path),
      [".claude/skills/a/SKILL.md", ".windsurf/rules/a.md"],
    )

    await removeFiles(cwd, candidates.map((candidate) => candidate.path))

    assert.equal(existsSync(join(cwd, ".claude")), false)
    assert.equal(existsSync(join(cwd, ".windsurf")), false)
    assert.equal(await readFile(join(cwd, ".cursor/rules/a.mdc"), "utf8"), pointer)
    assert.ok(existsSync(join(cwd, ".github/instructions/a.instructions.md")))
    assert.ok(existsSync(join(cwd, ".github/workflows/ci.yml")))
  })
})

test("every agent has a unique id and adapters have install targets", () => {
  assert.equal(new Set(agents.map((agent) => agent.id)).size, agents.length)

  for (const agent of adapterAgents) {
    assert.match(agent.targetPath("x"), /^\.[a-z]+\//)
  }
})
