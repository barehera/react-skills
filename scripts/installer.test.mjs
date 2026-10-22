import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import test from "node:test"

import {
  companionPlan,
  companions,
  recommendedCompanions,
  supportedAgents,
} from "../bin/companions.mjs"
import { adapterAgents, agentItemName, agents } from "../bin/install-targets.mjs"
import {
  catalogSkills,
  detectAgents,
  findExistingTargets,
  findInstalledSkills,
  findLegacyPointers,
  findPruneCandidates,
  globalSkillsCommand,
  globalVersionPaths,
  mergeExcludeBlock,
  parseArguments,
  planItems,
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
})

test("companions are opt-in and install through each agent's channel", () => {
  assert.equal(parseArguments([]).companionIds, null)
  assert.deepEqual(parseArguments(["--companions", "karpathy,Caveman", "--companion", "karpathy"]).companionIds, [
    "karpathy",
    "caveman",
  ])
  assert.deepEqual(parseArguments(["--companions", "none"]).companionIds, [])
  assert.throws(() => parseArguments(["--companions", "ponytail"]), /Unknown companion: ponytail/)
  assert.deepEqual(recommendedCompanions, ["karpathy"])

  const pack = (id) => companions.find((companion) => companion.id === id)
  const commands = (id, agentIds, hasClaudeCli) =>
    companionPlan(pack(id), agentIds, { hasClaudeCli }).steps.map((step) => step.join(" "))

  assert.deepEqual(commands("karpathy", ["claude", "cursor", "gemini"], true), [
    "claude plugin marketplace add forrestchang/andrej-karpathy-skills --scope user",
    "claude plugin install andrej-karpathy-skills@karpathy-skills --scope user",
    "npx --yes skills add forrestchang/andrej-karpathy-skills --skill * --agent cursor gemini-cli --global --yes",
  ])
  assert.deepEqual(commands("caveman", ["claude"], false), [
    "npx --yes skills add JuliusBrussee/caveman --skill * --agent claude-code --global --yes",
  ])
  assert.equal(companionPlan(pack("caveman"), ["claude"], { hasClaudeCli: false }).notes.length, 2)
  assert.deepEqual(supportedAgents(pack("claude-mem"), ["cursor", "claude"]), ["claude"])
  assert.deepEqual(commands("graphify", ["cursor", "kiro"], false), [
    "uv tool install graphifyy",
    "graphify cursor install",
  ])
  assert.deepEqual(commands("graphify", ["kiro"], false), [])
})

test("a global install runs the skills CLI and writes VERSION where skills land", () => {
  assert.equal(parseArguments(["-g"]).global, true)
  assert.equal(parseArguments(["--global", "--cwd", "."], "/project").global, true)
  assert.throws(() => parseArguments(["--global", "--cwd", "other"], "/project"), /drop --cwd/)
  assert.equal(
    globalSkillsCommand(["build-forms", "derived-types"], ["cursor", "claude"]).join(" "),
    "npx --yes skills add barehera/react-skills --skill build-forms derived-types --agent claude-code cursor --global --yes",
  )
  assert.deepEqual(globalVersionPaths(["cursor", "codex", "claude", "kiro"]), [
    ".agents/skills/VERSION",
    ".claude/skills/VERSION",
    ".kiro/skills/VERSION",
  ])
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
  assert.deepEqual(planItems(["build-forms"], ["claude", "cursor"]), [
    "barehera/react-skills/build-forms",
    "barehera/react-skills/build-forms-claude",
  ])
  assert.deepEqual(planItems(["build-forms"], ["cursor", "copilot", "windsurf", "codex", "gemini"]), [
    "barehera/react-skills/build-forms",
  ])
  assert.equal(planItems(["a", "b"], ["claude", "kiro", "cline", "codex"]).length, 8)
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

test("install state round-trips and ignores unknown agents", async () => {
  await withProject(async (cwd) => {
    assert.equal(await readInstallState(cwd), null)
    await writeInstallState(cwd, {
      version: "1.2.3",
      skills: ["b", "a", "a"],
      agents: ["windsurf", "claude"],
      companions: ["caveman", "karpathy"],
    })
    assert.deepEqual(await readInstallState(cwd), {
      version: "1.2.3",
      skills: ["a", "b"],
      agents: ["claude", "windsurf"],
      companions: ["karpathy", "caveman"],
    })
    await put(
      cwd,
      ".agents/skills/react-skills.json",
      '{"skills":["a"],"agents":["claude","vim"],"companions":["ponytail"]}',
    )
    assert.deepEqual((await readInstallState(cwd)).agents, ["claude"])
    assert.deepEqual((await readInstallState(cwd)).companions, [])
  })
})

test("existing targets and installed skills come from the project folder", async () => {
  await withProject(async (cwd) => {
    const skills = [
      { name: "a", files: [{ target: "~/.agents/skills/a/SKILL.md" }] },
      { name: "b", files: [{ target: "~/.agents/skills/b/SKILL.md" }] },
    ]

    await put(cwd, ".agents/skills/a/SKILL.md")
    await put(cwd, ".claude/skills/a/SKILL.md")
    await put(cwd, ".kiro/skills/a/SKILL.md")

    assert.deepEqual(findInstalledSkills(cwd, skills), ["a"])
    assert.deepEqual(findExistingTargets(cwd, skills, ["a", "b"], ["claude", "cursor"]), [
      ".agents/skills/a/SKILL.md",
      ".claude/skills/a/SKILL.md",
    ])
  })
})

test("pruning removes only generated pointers for unselected agents", async () => {
  await withProject(async (cwd) => {
    const pointer = "Read and follow `.agents/skills/a/SKILL.md`."

    await put(cwd, ".kiro/skills/a/SKILL.md", pointer)
    await put(cwd, ".cline/skills/a/SKILL.md", "Hand-written team skill")
    await put(cwd, ".claude/skills/a/SKILL.md", pointer)
    await put(cwd, ".github/workflows/ci.yml")

    const candidates = await findPruneCandidates(cwd, ["a"], ["claude"])

    assert.deepEqual(
      candidates.map((candidate) => candidate.path),
      [".kiro/skills/a/SKILL.md"],
    )

    await removeFiles(cwd, candidates.map((candidate) => candidate.path))

    assert.equal(existsSync(join(cwd, ".kiro")), false)
    assert.equal(await readFile(join(cwd, ".claude/skills/a/SKILL.md"), "utf8"), pointer)
    assert.ok(existsSync(join(cwd, ".cline/skills/a/SKILL.md")))
    assert.ok(existsSync(join(cwd, ".github/workflows/ci.yml")))
  })
})

test("rule pointers from older releases are found for removal, hand-written rules are kept", async () => {
  await withProject(async (cwd) => {
    const pointer = "Read and follow `.agents/skills/a/SKILL.md`."

    await put(cwd, ".cursor/rules/a.mdc", pointer)
    await put(cwd, ".windsurf/rules/a.md", pointer)
    await put(cwd, ".github/instructions/a.instructions.md", "Hand-written team rule")

    assert.deepEqual(await findLegacyPointers(cwd, ["a", "b"]), [
      ".cursor/rules/a.mdc",
      ".windsurf/rules/a.md",
    ])
  })
})

test("every agent has a unique id and adapters have install targets", () => {
  assert.equal(new Set(agents.map((agent) => agent.id)).size, agents.length)

  for (const agent of adapterAgents) {
    assert.match(agent.targetPath("x"), /^\.[a-z]+\//)
  }
})
