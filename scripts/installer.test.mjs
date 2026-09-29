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
  parseArguments,
  planItems,
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

test("a plan installs each skill once plus only the selected agents' pointers", () => {
  assert.deepEqual(planItems(["build-forms"], ["cursor"]), [
    "barehera/react-skills/build-forms",
    "barehera/react-skills/build-forms-cursor",
  ])
  assert.deepEqual(planItems(["build-forms"], ["codex"]), ["barehera/react-skills/build-forms"])
  assert.equal(planItems(["a", "b"], ["claude", "windsurf", "codex"]).length, 6)
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

test("install state round-trips and ignores unknown agents", async () => {
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
  })
})

test("existing targets and installed skills come from the project folder", async () => {
  await withProject(async (cwd) => {
    const skills = [
      { name: "a", files: [{ target: "~/.agents/skills/a/SKILL.md" }] },
      { name: "b", files: [{ target: "~/.agents/skills/b/SKILL.md" }] },
    ]

    await put(cwd, ".agents/skills/a/SKILL.md")
    await put(cwd, ".cursor/rules/a.mdc")
    await put(cwd, ".windsurf/rules/a.md")

    assert.deepEqual(findInstalledSkills(cwd, skills), ["a"])
    assert.deepEqual(findExistingTargets(cwd, skills, ["a", "b"], ["cursor"]), [
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
