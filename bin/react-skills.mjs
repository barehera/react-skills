#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import prompts from "prompts";

import { agents, skillsRoot } from "./install-targets.mjs";
import {
  agentLabels,
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
  readInstalledVersion,
  removeFiles,
  resolveSkills,
  writeInstallState,
} from "./installer.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = resolve(packageRoot, "registry.json");
const versionPath = resolve(packageRoot, "VERSION");
// npx runs a fresh package from the private repository on every call; a
// linked clone runs as `react-skills` and pulls before updating.
const command = existsSync(resolve(packageRoot, ".git"))
  ? "react-skills"
  : "npx --yes git+ssh://git@react-skills/barehera/react-skills.git";
const terminalReset = "\u001B[0m\u001B[?25h";

class Cancelled extends Error {}

function restoreTerminal() {
  if (process.stdout.isTTY) {
    process.stdout.write(terminalReset);
  }
}

function printHelp() {
  console.log(`React Skills

Install Agent Skills from your local React Skills copy for the agents you use.

Usage:
  ${command}                        Choose skills and agents
  ${command} <skill...> [options]   Install named skills
  ${command} update                 Download the latest skills and update
  ${command} list                   List skills and agents

Selector:
  Arrow keys         Move
  Space              Select or clear
  A                  Toggle every skill
  Enter              Continue

Options:
  --agent <ids>      Agents to install for: ${agents.map((agent) => agent.id).join(", ")}
                     (comma-separated; saved for the next update)
  --global           Install once for Claude Code in ~/.claude/skills,
                     for every project
  --all              Select every skill
  --overwrite        Replace existing React Skills files without asking
  --prune            Remove React Skills pointer files for agents you did not select
  --yes              Accept every default without asking
  --dry-run          Preview the installation
  --cwd <path>       Install into a different project
  --help             Show this help
`);
}

function printCatalog(skills, releaseVersion) {
  console.log(`\nReact Skills v${releaseVersion}\n`);

  skills.forEach((skill, index) => {
    console.log(`${index + 1}. ${skill.title ?? skill.name}`);
    console.log(`   ${skill.description ?? skill.name}`);
    console.log(`   ${skill.name}\n`);
  });

  console.log("Agents (--agent):");

  for (const agent of agents) {
    console.log(`  ${agent.id.padEnd(9)}${agentChoiceTitle(agent)}`);
  }

  console.log("");
}

function agentChoiceTitle(agent) {
  return agent.targetPath
    ? `${agent.label} (${agent.targetPath("<skill>")})`
    : `${agent.label} (reads ${skillsRoot}/<skill>, no extra file)`;
}

async function ask(question) {
  const answers = await prompts(question, {
    onCancel() {
      throw new Cancelled();
    },
  });

  return answers.value;
}

async function chooseSkills(skills, releaseVersion, preselected) {
  const selected = await ask({
    type: "multiselect",
    name: "value",
    message: `Which skills would you like to install? (React Skills v${releaseVersion})`,
    hint: "Space to select. A to toggle all. Enter to submit.",
    instructions: false,
    choices: skills.map((skill) => ({
      title: skill.title ?? skill.name,
      description: skill.description,
      value: skill.name,
      selected: preselected.includes(skill.name),
    })),
  });

  if (selected.length === 0) {
    throw new Error("Select at least one skill.");
  }

  return selected;
}

async function chooseAgents(preselected) {
  const selected = await ask({
    type: "multiselect",
    name: "value",
    message: "Which agents do you use in this project?",
    hint: "Space to select. Enter to submit.",
    instructions: false,
    choices: agents.map((agent) => ({
      title: agentChoiceTitle(agent),
      value: agent.id,
      selected: preselected.includes(agent.id),
    })),
  });

  if (selected.length === 0) {
    throw new Error("Select at least one agent.");
  }

  return selected;
}

function countFiles(count) {
  return `${count} React Skills ${count === 1 ? "file" : "files"}`;
}

function confirm(message, initial) {
  return ask({ type: "confirm", name: "value", message, initial });
}

function git(args, cwd, stdio = "pipe") {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", stdio });

  return result.status === 0 ? (result.stdout ?? "").trim() : null;
}

function runtimeDependencies() {
  const packageJson = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"));

  return JSON.stringify(packageJson.dependencies ?? {});
}

// A clone of the private repository downloads the latest release before
// updating, then hands over to the updated installer. Returns true when the
// updated installer already ran.
function pullLatest() {
  if (process.env.REACT_SKILLS_PULLED || !existsSync(resolve(packageRoot, ".git"))) {
    return false;
  }

  const before = git(["rev-parse", "HEAD"], packageRoot);
  const dependencies = runtimeDependencies();

  console.log("Downloading the latest React Skills...");

  if (git(["pull", "--ff-only", "--quiet"], packageRoot, "inherit") === null) {
    console.log("Could not download the latest skills. Updating from the copy you already have.");
    return false;
  }

  if (git(["rev-parse", "HEAD"], packageRoot) === before) {
    return false;
  }

  if (runtimeDependencies() !== dependencies) {
    const npmArguments = ["install", "--omit=dev", "--no-audit", "--no-fund"];
    const stdio = "inherit";

    if (process.platform === "win32") {
      spawnSync(["npm", ...npmArguments].join(" "), { cwd: packageRoot, shell: true, stdio });
    } else {
      spawnSync("npm", npmArguments, { cwd: packageRoot, stdio });
    }
  }

  const result = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: "inherit",
    env: { ...process.env, REACT_SKILLS_PULLED: "1" },
  });

  process.exitCode = result.status ?? 1;
  return true;
}

// Lists the installed skills in `.git/info/exclude`, which git reads but
// never commits, so the skills stay private to this machine.
async function keepOutOfGit(cwd, skillNames) {
  const excludeFile = git(["rev-parse", "--git-path", "info/exclude"], cwd);

  if (excludeFile === null) {
    return;
  }

  const prefix = git(["rev-parse", "--show-prefix"], cwd) ?? "";
  const paths = projectPaths(skillNames);
  const excludePath = resolve(cwd, excludeFile);
  const current = existsSync(excludePath) ? await readFile(excludePath, "utf8") : "";

  await mkdir(dirname(excludePath), { recursive: true });
  await writeFile(
    excludePath,
    mergeExcludeBlock(current, paths.map((path) => `/${prefix}${path}`)),
    "utf8",
  );
  console.log("Kept the skills out of git: they are listed in .git/info/exclude, which is never committed.");

  const tracked = (git(["ls-files", "--", ...paths], cwd) ?? "").split("\n").filter(Boolean);
  const committed = paths.filter((path) =>
    tracked.some((file) => (path.endsWith("/") ? file.startsWith(path) : file === path)),
  );

  if (committed.length > 0) {
    console.log(`\nThese React Skills files were committed earlier, so git still shares them:
  ${committed.join("\n  ")}
Stop sharing them (your local copies stay) with:
  git rm -r --cached ${committed.join(" ")}`);
  }
}

async function selectSkills(options, skills, state, releaseVersion, interactive, root, layout) {
  if (options.all) {
    return skills.map((skill) => skill.name);
  }

  if (options.skillNames.length > 0) {
    return resolveSkills(options.skillNames, skills);
  }

  if (options.command === "update") {
    const recorded = state?.skills ?? findInstalledSkills(root, skills, layout);
    const known = recorded.filter((name) => skills.some((skill) => skill.name === name));
    const removed = recorded.filter((name) => !known.includes(name));

    if (removed.length > 0) {
      console.log(`Skipping skills no longer in the catalog: ${removed.join(", ")}`);
    }

    if (known.length === 0) {
      const installCommand = options.global ? `${command} --global` : command;

      throw new Error(`No installed React Skills found in ${root}. Run ${installCommand} first.`);
    }

    return known;
  }

  if (!interactive) {
    throw new Error("Interactive selection needs a terminal. Pass skill names, --all, or --list.");
  }

  return chooseSkills(skills, releaseVersion, state?.skills ?? []);
}

async function selectAgents(options, state, interactive) {
  if (options.global) {
    return ["claude"];
  }

  if (options.agentIds.length > 0) {
    return options.agentIds;
  }

  const saved = state?.agents ?? [];
  const opensSelector =
    options.command === "install" && options.skillNames.length === 0 && !options.all;

  if (saved.length > 0 && !(interactive && opensSelector)) {
    return saved;
  }

  const detected = await detectAgents(options.cwd);

  if (interactive) {
    return chooseAgents(saved.length > 0 ? saved : detected);
  }

  if (detected.length > 0) {
    console.log(`Using detected agents: ${agentLabels(detected).join(", ")}. Pass --agent to change.`);
    return detected;
  }

  throw new Error(
    `Choose agents with --agent (${agents.map((agent) => agent.id).join(", ")}).`,
  );
}

async function decideOverwrite(options, root, plan, releaseVersion, interactive) {
  if (options.overwrite || options.command === "update") {
    return true;
  }

  const existing = findExistingTargets(root, plan);

  if (existing.length === 0) {
    return false;
  }

  if (options.yes) {
    return true;
  }

  if (!interactive) {
    throw new Error(
      `${countFiles(existing.length)} already exist. Pass --overwrite to replace them, or run ${command} update.`,
    );
  }

  return confirm(
    `${countFiles(existing.length)} already exist. Replace them with v${releaseVersion}? (No keeps them)`,
    true,
  );
}

async function pruneOtherAgents(options, skills, skillNames, agentIds, interactive) {
  const installed = [...new Set([...skillNames, ...findInstalledSkills(options.cwd, skills)])];
  const candidates = await findPruneCandidates(options.cwd, installed, agentIds);

  if (candidates.length === 0) {
    return;
  }

  const labels = agentLabels([...new Set(candidates.map((candidate) => candidate.agentId))]);
  const paths = candidates.map((candidate) => candidate.path);
  const summary = `${countFiles(paths.length)} for ${labels.join(", ")}`;

  if (options.dryRun) {
    console.log(`\nWould remove ${summary}:\n  ${paths.join("\n  ")}`);
    return;
  }

  const shouldRemove =
    options.prune ||
    (interactive &&
      !options.yes &&
      (await confirm(`Remove ${summary} (agents you did not select)?`, false)));

  if (!shouldRemove) {
    console.log(`\nKept ${summary}. Remove them later with --prune.`);
    return;
  }

  await removeFiles(options.cwd, paths);
  console.log(`\nRemoved ${summary}.`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.command === "help") {
    printHelp();
    return;
  }

  if (options.command === "update" && pullLatest()) {
    return;
  }

  const [registryItems, releaseVersion] = await Promise.all([
    readCatalog(registryPath),
    readFile(versionPath, "utf8").then((value) => value.trim()),
  ]);
  const skills = catalogSkills(registryItems);

  if (skills.length === 0) {
    throw new Error("The React Skills catalog is empty.");
  }

  if (options.command === "list") {
    printCatalog(skills, releaseVersion);
    return;
  }

  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const layout = installLayout(options.global);
  const root = options.global ? homedir() : options.cwd;
  const state = await readInstallState(root, layout);
  const skillNames = await selectSkills(
    options,
    skills,
    state,
    releaseVersion,
    interactive,
    root,
    layout,
  );
  const agentIds = await selectAgents(options, state, interactive);
  const plan = planFiles(skillNames, agentIds, registryItems, layout);
  const overwrite = await decideOverwrite(options, root, plan, releaseVersion, interactive);
  const audience = options.global
    ? `Claude Code in ~/${layout.skillsRoot}`
    : agentLabels(agentIds).join(", ");

  const action =
    options.command === "update"
      ? `Updating ${skillNames.join(", ")} to v${releaseVersion}`
      : `Installing ${skillNames.join(", ")}`;

  console.log(`\n${action} for ${audience}...\n`);

  if (options.dryRun) {
    console.log(`Would write ${countFiles(plan.length)}:\n  ${plan.map((file) => file.target).join("\n  ")}`);

    if (!options.global) {
      await pruneOtherAgents(options, skills, skillNames, agentIds, interactive);
    }

    return;
  }

  const { written, kept } = await installFiles(root, plan, layout, skillNames, overwrite);

  console.log(`Wrote ${countFiles(written)}.`);

  if (kept.length > 0) {
    console.log(`Kept ${countFiles(kept.length)} you already had. Replace them with --overwrite.`);
  }

  if (!options.global) {
    await pruneOtherAgents(options, skills, skillNames, agentIds, interactive);
  }

  const catalogNames = skills.map((skill) => skill.name);
  const previousSkills = (state?.skills ?? []).filter((name) => catalogNames.includes(name));

  await writeInstallState(
    root,
    {
      version: (await readInstalledVersion(root, layout)) ?? releaseVersion,
      skills: options.command === "update" ? skillNames : [...previousSkills, ...skillNames],
      agents: agentIds,
    },
    layout,
  );

  const installed = findInstalledSkills(root, skills, layout);
  const notInstalled = catalogNames.filter((name) => !installed.includes(name));
  const globalFlag = options.global ? " --global" : "";

  if (!options.global) {
    await keepOutOfGit(options.cwd, installed);
  }

  console.log(
    `\nSaved your selection in ${options.global ? "~/" : ""}${layout.skillsRoot}/react-skills.json.`,
  );

  if (options.command === "update" && notInstalled.length > 0) {
    console.log(`More skills available: ${notInstalled.join(", ")}`);
    console.log(`Add one with: ${command} <skill>${globalFlag}`);
  }

  console.log(`Update later with: ${command} update${globalFlag}\n`);
}

main()
  .catch((error) => {
    if (error instanceof Cancelled) {
      console.log("\nInstallation cancelled.\n");
      return;
    }

    console.error(`\nReact Skills: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(restoreTerminal);
