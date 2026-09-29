#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import prompts from "prompts";

import { agents, registryAddress, skillsRoot } from "./install-targets.mjs";
import {
  agentLabels,
  catalogSkills,
  detectAgents,
  findExistingTargets,
  findInstalledSkills,
  findPruneCandidates,
  parseArguments,
  planItems,
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
  console.log(`React Skills

Install Agent Skills from ${registryAddress} for the agents you use.

Usage:
  ${command}                        Choose skills and agents
  ${command} <skill...> [options]   Install named skills
  ${command} update                 Update installed skills
  ${command} list                   List skills and agents

Selector:
  Arrow keys         Move
  Space              Select or clear
  A                  Toggle every skill
  Enter              Continue

Options:
  --agent <ids>      Agents to install for: ${agents.map((agent) => agent.id).join(", ")}
                     (comma-separated; saved for the next update)
  --all              Select every skill
  --overwrite        Replace existing React Skills files without asking
  --prune            Remove React Skills pointer files for agents you did not select
  --yes              Accept every default without asking
  --dry-run          Preview the installation
  --silent           Reduce shadcn output
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
      throw new Error(`No installed React Skills found in ${options.cwd}. Run ${command} first.`);
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
  const state = await readInstallState(options.cwd);
  const skillNames = await selectSkills(options, skills, state, releaseVersion, interactive);
  const agentIds = await selectAgents(options, state, interactive);
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

  if (options.dryRun) {
    return;
  }

  const catalogNames = skills.map((skill) => skill.name);
  const previousSkills = (state?.skills ?? []).filter((name) => catalogNames.includes(name));

  await writeInstallState(options.cwd, {
    version: (await readInstalledVersion(options.cwd)) ?? releaseVersion,
    skills: options.command === "update" ? skillNames : [...previousSkills, ...skillNames],
    agents: agentIds,
  });

  const installed = findInstalledSkills(options.cwd, skills);
  const notInstalled = catalogNames.filter((name) => !installed.includes(name));

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

    console.error(`\nReact Skills: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(restoreTerminal);
