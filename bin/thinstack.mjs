#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import prompts from "prompts";

import {
  companionPlan,
  companions,
  recommendedCompanions,
  supportedAgents,
} from "./companions.mjs";
import { agents, registryAddress, skillsRoot } from "./install-targets.mjs";
import {
  agentLabels,
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
  readInstalledVersion,
  removeFiles,
  resolveSkills,
  stateFile,
  writeInstallState,
} from "./installer.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = resolve(packageRoot, "registry.json");
const versionPath = resolve(packageRoot, "VERSION");
const command = `npx --yes github:${registryAddress}`;
const terminalReset = "\u001B[0m\u001B[?25h";

class Cancelled extends Error {}

function restoreTerminal() {
  if (process.stdout.isTTY) {
    process.stdout.write(terminalReset);
  }
}

function printHelp() {
  console.log(`Thinstack

Install Agent Skills from ${registryAddress} for the agents you use.

Usage:
  ${command}                        Choose skills and agents
  ${command} <skill...> [options]   Install named skills
  ${command} update                 Update installed skills
  ${command} --global               Install for every project (your user)
  ${command} update --global        Update the global install
  ${command} list                   List skills and agents

Selector:
  Arrow keys         Move
  Space              Select or clear
  A                  Toggle every skill
  Enter              Continue

Options:
  --agent <ids>      Agents to install for: ${agents.map((agent) => agent.id).join(", ")}
                     (comma-separated; saved for the next update)
  --companions <ids> Third-party packs to add: ${companions.map((companion) => companion.id).join(", ")}, or none
  --all            Select every skill
  --overwrite        Replace existing Thinstack files without asking
  --prune            Remove Thinstack pointer files for agents you did not select
  --yes              Accept every default without asking
  --dry-run          Preview the installation
  --silent           Reduce shadcn output
  --global, -g       Install for your user in every project, through the skills CLI
  --cwd <path>       Install into a different project
  --help             Show this help
`);
}

function printCatalog(skills, releaseVersion) {
  console.log(`\nThinstack v${releaseVersion}\n`);

  skills.forEach((skill, index) => {
    console.log(`${index + 1}. ${skill.title ?? skill.name}`);
    console.log(`   ${skill.description ?? skill.name}`);
    console.log(`   ${skill.name}\n`);
  });

  console.log("Agents (--agent):");

  for (const agent of agents) {
    console.log(`  ${agent.id.padEnd(9)}${agentChoiceTitle(agent)}`);
  }

  console.log("\nCompanion packs (--companions):");

  for (const companion of companions) {
    console.log(`  ${companion.id.padEnd(12)}${companion.summary}`);
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
    message: `Which skills would you like to install? (Thinstack v${releaseVersion})`,
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

async function chooseCompanions(available) {
  return ask({
    type: "multiselect",
    name: "value",
    message: "Add companion packs for your agents? (third-party, optional)",
    hint: "Space to select. Enter to submit, or skip with none selected.",
    instructions: false,
    choices: available.map((companion) => ({
      title: companion.recommended ? `${companion.label} (recommended)` : companion.label,
      description: companion.summary,
      value: companion.id,
      selected: recommendedCompanions.includes(companion.id),
    })),
  });
}

function countFiles(count) {
  return `${count} Thinstack ${count === 1 ? "file" : "files"}`;
}

function confirm(message, initial) {
  return ask({ type: "confirm", name: "value", message, initial });
}

function runShadcn(addresses, flags, cwd) {
  const commandArguments = ["--yes", "shadcn@latest", "add", ...addresses, "--yes", ...flags];
  // shadcn writes successful progress updates to stderr. Forward both visible
  // streams normally so PowerShell does not render a successful install in red.
  const stdio = ["inherit", "inherit", process.stdout];
  const result =
    process.platform === "win32"
      ? spawnSync(["npx", ...commandArguments].join(" "), { cwd, shell: true, stdio })
      : spawnSync("npx", commandArguments, { cwd, stdio });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

function run(commandArguments, cwd, stdio = "inherit") {
  const result =
    process.platform === "win32"
      ? spawnSync(commandArguments.join(" "), { cwd, shell: true, stdio })
      : spawnSync(commandArguments[0], commandArguments.slice(1), { cwd, stdio });

  return result.error ? 1 : (result.status ?? 1);
}

function hasCommand(name, cwd) {
  return run([name, "--version"], cwd, "ignore") === 0;
}

// Companion packs are third-party, so they are asked for once and never
// chosen by --yes; update leaves them to each pack's own updater.
async function selectCompanions(options, state, agentIds, interactive) {
  if (options.companionIds !== null) {
    return options.companionIds;
  }

  if (options.command === "update" || options.yes || !interactive) {
    return [];
  }

  const installed = state?.companions ?? [];
  const available = companions.filter(
    (companion) =>
      !installed.includes(companion.id) && supportedAgents(companion, agentIds).length > 0,
  );

  return available.length === 0 ? [] : chooseCompanions(available);
}

function installCompanions(companionIds, agentIds, options) {
  const installed = [];
  const hasClaudeCli = agentIds.includes("claude") && hasCommand("claude", options.cwd);

  for (const companion of companions.filter((item) => companionIds.includes(item.id))) {
    const supported = supportedAgents(companion, agentIds);
    const skipped = agentLabels(agentIds.filter((id) => !supported.includes(id)));
    const { steps, notes } = companionPlan(companion, agentIds, { hasClaudeCli });
    const listed = (lines) => lines.map((line) => `  ${line}`).join("\n");

    if (skipped.length > 0) {
      console.log(`\n${companion.label} has no install for ${skipped.join(", ")}.`);
    }

    if (supported.length === 0) {
      continue;
    }

    if (options.dryRun) {
      console.log(`\nWould add ${companion.label}:\n${listed(steps.map((step) => step.join(" ")))}`);
      continue;
    }

    if (steps.length > 0 && !hasCommand(steps[0][0], options.cwd)) {
      console.log(`\n${companion.label}: \`${steps[0][0]}\` is not on PATH. Run these yourself:
${listed([...steps.map((step) => step.join(" ")), ...notes])}`);
      continue;
    }

    console.log(`\nAdding ${companion.label}...`);

    if (steps.every((step) => run(step, options.cwd) === 0)) {
      installed.push(companion.id);
    } else {
      console.log(`${companion.label} did not finish. Retry with:\n${listed(steps.map((step) => step.join(" ")))}`);
    }

    if (notes.length > 0) {
      console.log(`In Claude Code, add ${companion.label} as a plugin (with its hooks):\n${listed(notes)}`);
    }
  }

  return installed;
}

function git(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });

  return result.status === 0 ? result.stdout.trim() : null;
}

// Lists the installed skills in `.git/info/exclude`, which git reads but
// never commits, so the skills stay private to this clone.
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
  console.log("Kept the skills out of git with .git/info/exclude, which is never committed.");

  const tracked = (git(["ls-files", "--", ...paths], cwd) ?? "").split("\n").filter(Boolean);
  const committed = paths.filter((path) =>
    tracked.some((file) => (path.endsWith("/") ? file.startsWith(path) : file === path)),
  );

  if (committed.length > 0) {
    console.log(`\nThese Thinstack files are committed, so git keeps tracking them:
  ${committed.join("\n  ")}
To keep them local only (your copies stay), run:
  git rm -r --cached ${committed.join(" ")}`);
  }
}

async function selectSkills(options, skills, state, releaseVersion, interactive) {
  if (options.all) {
    return skills.map((skill) => skill.name);
  }

  if (options.skillNames.length > 0) {
    return resolveSkills(options.skillNames, skills);
  }

  if (options.command === "update") {
    const recorded = state?.skills ?? findInstalledSkills(options.cwd, skills);
    const known = recorded.filter((name) => skills.some((skill) => skill.name === name));
    const removed = recorded.filter((name) => !known.includes(name));

    if (removed.length > 0) {
      console.log(`Skipping skills no longer in the catalog: ${removed.join(", ")}`);
    }

    if (known.length === 0) {
      throw new Error(`No installed Thinstack skills found in ${options.cwd}. Run ${command} first.`);
    }

    return known;
  }

  if (!interactive) {
    throw new Error("Interactive selection needs a terminal. Pass skill names, --all, or --list.");
  }

  return chooseSkills(skills, releaseVersion, state?.skills ?? []);
}

async function selectAgents(options, state, interactive) {
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

async function decideOverwrite(options, skills, skillNames, agentIds, releaseVersion, interactive) {
  if (options.overwrite || options.command === "update") {
    return true;
  }

  const existing = findExistingTargets(options.cwd, skills, skillNames, agentIds);

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
    `${countFiles(existing.length)} already exist. Replace them with v${releaseVersion}? (No asks for each file)`,
    true,
  );
}

// Cursor, Copilot, and Windsurf now read `.agents/skills` themselves, so the
// rule pointers older releases wrote for them would load each skill twice.
async function removeLegacyPointers(options, skills, skillNames) {
  const installed = [...new Set([...skillNames, ...findInstalledSkills(options.cwd, skills)])];
  const paths = await findLegacyPointers(options.cwd, installed);

  if (paths.length === 0) {
    return;
  }

  if (options.dryRun) {
    console.log(`\nWould remove ${countFiles(paths.length)} from older releases:\n  ${paths.join("\n  ")}`);
    return;
  }

  await removeFiles(options.cwd, paths);
  console.log(`\nRemoved ${countFiles(paths.length)} from older releases; their agents read ${skillsRoot} now.`);
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

// The selector asks once where the skills go; flags and updates never ask.
async function chooseGlobal(options, interactive) {
  const opensSelector =
    options.command === "install" && options.skillNames.length === 0 && !options.all;

  if (options.global || !interactive || options.yes || !opensSelector) {
    return false;
  }

  return ask({
    type: "select",
    name: "value",
    message: "Where should the skills go?",
    choices: [
      { title: "This project", description: options.cwd, value: false },
      { title: "Every project", description: "For your user, like the companion packs", value: true },
    ],
    initial: 0,
  });
}

async function installGlobal(options, skills, skillNames, agentIds, companionIds, state, releaseVersion) {
  const step = globalSkillsCommand(skillNames, agentIds);

  console.log(
    `\n${options.command === "update" ? "Updating" : "Installing"} ${skillNames.join(", ")} for ${agentLabels(agentIds).join(", ")} in every project...\n`,
  );

  if (options.dryRun) {
    console.log(`Would run:\n  ${step.join(" ")}`);
  } else {
    const status = run(step, options.cwd);

    if (status !== 0) {
      process.exitCode = status;
      return;
    }
  }

  const installedCompanions = installCompanions(companionIds, agentIds, options);

  if (options.dryRun) {
    return;
  }

  for (const path of globalVersionPaths(agentIds)) {
    await mkdir(dirname(resolve(options.cwd, path)), { recursive: true });
    await writeFile(resolve(options.cwd, path), `${releaseVersion}\n`, "utf8");
  }

  const catalogNames = skills.map((skill) => skill.name);
  const previousSkills = (state?.skills ?? []).filter((name) => catalogNames.includes(name));

  await writeInstallState(options.cwd, {
    version: releaseVersion,
    skills: options.command === "update" ? skillNames : [...previousSkills, ...skillNames],
    agents: agentIds,
    companions: [...(state?.companions ?? []), ...installedCompanions],
  });

  console.log(`\nSaved your selection in ~/${stateFile}.`);
  console.log(`Update later with: ${command} update --global\n`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.command === "help") {
    printHelp();
    return;
  }

  const [registryItems, releaseVersion] = await Promise.all([
    readCatalog(registryPath),
    readFile(versionPath, "utf8").then((value) => value.trim()),
  ]);
  const skills = catalogSkills(registryItems);

  if (skills.length === 0) {
    throw new Error("The Thinstack catalog is empty.");
  }

  if (options.command === "list") {
    printCatalog(skills, releaseVersion);
    return;
  }

  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

  if (await chooseGlobal(options, interactive)) {
    options.global = true;
  }

  // A global install keeps its state and VERSION under the home folder, so
  // update, detection, and selection read the same files a project would.
  if (options.global) {
    options.cwd = homedir();
  }

  const state = await readInstallState(options.cwd);
  const skillNames = await selectSkills(options, skills, state, releaseVersion, interactive);
  const agentIds = await selectAgents(options, state, interactive);
  const companionIds = await selectCompanions(options, state, agentIds, interactive);

  if (options.global) {
    await installGlobal(options, skills, skillNames, agentIds, companionIds, state, releaseVersion);
    return;
  }

  const overwrite = await decideOverwrite(
    options,
    skills,
    skillNames,
    agentIds,
    releaseVersion,
    interactive,
  );
  const flags = [
    ...(overwrite ? ["--overwrite"] : []),
    ...(options.dryRun ? ["--dry-run"] : []),
    ...(options.silent ? ["--silent"] : []),
  ];

  console.log(
    `\n${options.command === "update" ? "Updating" : "Installing"} ${skillNames.join(", ")} for ${agentLabels(agentIds).join(", ")}...\n`,
  );

  const status = runShadcn(planItems(skillNames, agentIds), flags, options.cwd);

  if (status !== 0) {
    process.exitCode = status;
    return;
  }

  await pruneOtherAgents(options, skills, skillNames, agentIds, interactive);
  await removeLegacyPointers(options, skills, skillNames);

  const installedCompanions = installCompanions(companionIds, agentIds, options);

  if (options.dryRun) {
    return;
  }

  const catalogNames = skills.map((skill) => skill.name);
  const previousSkills = (state?.skills ?? []).filter((name) => catalogNames.includes(name));

  await writeInstallState(options.cwd, {
    version: (await readInstalledVersion(options.cwd)) ?? releaseVersion,
    skills: options.command === "update" ? skillNames : [...previousSkills, ...skillNames],
    agents: agentIds,
    companions: [...(state?.companions ?? []), ...installedCompanions],
  });

  const installed = findInstalledSkills(options.cwd, skills);
  const notInstalled = catalogNames.filter((name) => !installed.includes(name));

  await keepOutOfGit(options.cwd, installed);
  console.log(`\nSaved your selection in ${stateFile}.`);

  if (options.command === "update" && notInstalled.length > 0) {
    console.log(`More skills available: ${notInstalled.join(", ")}`);
    console.log(`Add one with: ${command} <skill>`);
  }

  console.log(`Update later with: ${command} update\n`);
}

main()
  .catch((error) => {
    if (error instanceof Cancelled) {
      console.log("\nInstallation cancelled.\n");
      return;
    }

    console.error(`\nThinstack: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(restoreTerminal);
