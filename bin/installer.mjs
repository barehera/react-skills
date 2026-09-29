// Installer decisions without prompts or process spawning, so they can be
// tested against a temporary project folder.

import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, rm, rmdir, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";

import {
  adapterAgents,
  agentItemName,
  agents,
  globalSkillsRoot,
  isGeneratedPointer,
  pointerMarker,
  registryAddress,
  skillsRoot,
} from "./install-targets.mjs";

export const stateFile = `${skillsRoot}/react-skills.json`;

const booleanFlags = new Map([
  ["--overwrite", "overwrite"],
  ["-o", "overwrite"],
  ["--prune", "prune"],
  ["--yes", "yes"],
  ["-y", "yes"],
  ["--dry-run", "dryRun"],
  ["--all", "all"],
  ["--global", "global"],
  ["-g", "global"],
]);

export function parseArguments(argumentList, cwd = process.cwd()) {
  const options = {
    command: "install",
    skillNames: [],
    agentIds: [],
    all: false,
    global: false,
    cwd,
    overwrite: false,
    prune: false,
    yes: false,
    dryRun: false,
  };

  for (let index = 0; index < argumentList.length; index += 1) {
    const argument = argumentList[index];

    if (argument === "--help" || argument === "-h") {
      return { ...options, command: "help" };
    }

    if (argument === "--list" || (argument === "list" && index === 0)) {
      options.command = "list";
      continue;
    }

    if (argument === "update" && index === 0) {
      options.command = "update";
      continue;
    }

    if (booleanFlags.has(argument)) {
      options[booleanFlags.get(argument)] = true;
      continue;
    }

    const isAgentOption = ["--agent", "--agents", "-a"].includes(argument);

    if (isAgentOption || argument === "--cwd" || argument === "-c") {
      const value = argumentList[index + 1];

      if (!value || value.startsWith("-")) {
        throw new Error(`${argument} requires a value`);
      }

      if (isAgentOption) {
        options.agentIds.push(...parseAgentIds(value));
      } else {
        options.cwd = resolve(cwd, value);
      }

      index += 1;
      continue;
    }

    if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    }

    options.skillNames.push(...argument.split(",").filter(Boolean));
  }

  options.agentIds = [...new Set(options.agentIds)];

  if (options.global && options.agentIds.some((id) => id !== "claude")) {
    throw new Error("--global installs for Claude Code only; other agents read skills from the project.");
  }

  return options;
}

export function parseAgentIds(value) {
  const ids = value
    .split(",")
    .map((id) => id.trim().toLowerCase())
    .filter(Boolean);
  const unknown = ids.filter((id) => !agents.some((agent) => agent.id === id));

  if (unknown.length > 0) {
    throw new Error(
      `Unknown agent: ${unknown.join(", ")}. Choose from ${agents.map((agent) => agent.id).join(", ")}.`,
    );
  }

  return ids;
}

// Where an install writes. A project install keeps the canonical skill in
// `.agents/skills` and adds agent pointers; a global install has no pointers.
export function installLayout(global) {
  return { global, skillsRoot: global ? globalSkillsRoot : skillsRoot };
}

function layoutStateFile(layout) {
  return `${layout.skillsRoot}/react-skills.json`;
}

export async function readCatalog(registryPath, visited = new Set()) {
  const resolvedPath = resolve(registryPath);

  if (visited.has(resolvedPath)) {
    throw new Error(`Circular registry include: ${resolvedPath}`);
  }

  visited.add(resolvedPath);

  const registry = JSON.parse(await readFile(resolvedPath, "utf8"));
  const included = await Promise.all(
    (registry.include ?? []).map((includePath) =>
      readCatalog(resolve(dirname(resolvedPath), includePath), visited),
    ),
  );
  // Item file paths are relative to the registry file that declares them.
  const sourceDirectory = dirname(resolvedPath);

  return [
    ...(registry.items ?? []).map((item) => ({ ...item, sourceDirectory })),
    ...included.flat(),
  ];
}

// Skill items are the catalog; agent items are an install detail of a skill.
export function catalogSkills(registryItems) {
  return registryItems.filter(
    (item) => item.type === "registry:item" && item.meta?.agent === undefined,
  );
}

export function resolveSkills(names, skills) {
  if (names.some((name) => name.toLowerCase() === "all")) {
    return skills.map((skill) => skill.name);
  }

  const resolved = names.map((name) => {
    const position = Number(name);

    if (Number.isInteger(position) && position >= 1) {
      return skills[position - 1]?.name;
    }

    return skills.find((skill) => skill.name === name)?.name;
  });
  const unknown = names.filter((_, index) => !resolved[index]);

  if (unknown.length > 0) {
    throw new Error(
      `Unknown skill: ${unknown.join(", ")}. Run with --list to see the catalog.`,
    );
  }

  return [...new Set(resolved)];
}

// Registry targets start with `~/`, the install root. A global install moves
// the canonical skill folder to the one Claude Code reads.
function installTarget(target, layout) {
  const path = target.replace(/^~\//, "");

  return layout.global && path.startsWith(`${skillsRoot}/`)
    ? `${layout.skillsRoot}/${path.slice(skillsRoot.length + 1)}`
    : path;
}

// Every file the selected skills and agent pointers install, including their
// registry dependencies, as a local source and a target inside the root.
export function planFiles(skillNames, agentIds, registryItems, layout = installLayout(false)) {
  const itemsByName = new Map(registryItems.map((item) => [item.name, item]));
  const pointerIds = layout.global
    ? []
    : adapterAgents.filter((agent) => agentIds.includes(agent.id)).map((agent) => agent.id);
  const queue = skillNames.flatMap((skill) => [
    skill,
    ...pointerIds.map((id) => agentItemName(skill, id)),
  ]);
  const visited = new Set();
  const files = [];

  while (queue.length > 0) {
    const name = queue.shift();

    if (visited.has(name)) continue;
    visited.add(name);

    const item = itemsByName.get(name);

    if (!item) {
      throw new Error(`The React Skills catalog has no item named ${name}`);
    }

    queue.push(
      ...(item.registryDependencies ?? []).map((address) =>
        address.replace(`${registryAddress}/`, ""),
      ),
    );

    for (const file of item.files ?? []) {
      files.push({
        source: resolve(item.sourceDirectory, file.path),
        target: installTarget(file.target, layout),
      });
    }
  }

  return files;
}

// Replacing clears each skill's canonical folder first, so files a release
// removed from a skill do not linger. Without replacing, existing files stay.
export async function installFiles(root, plan, layout, skillNames, overwrite) {
  if (overwrite) {
    for (const skill of skillNames) {
      await rm(resolve(root, layout.skillsRoot, skill), { recursive: true, force: true });
    }
  }

  const kept = [];
  let written = 0;

  for (const file of plan) {
    const target = resolve(root, file.target);

    if (!overwrite && existsSync(target)) {
      kept.push(file.target);
      continue;
    }

    await mkdir(dirname(target), { recursive: true });
    await copyFile(file.source, target);
    written += 1;
  }

  return { written, kept };
}

export function agentLabels(agentIds) {
  return agents
    .filter((agent) => agentIds.includes(agent.id))
    .map((agent) => agent.label);
}

// A folder that holds only React Skills pointers was created by an earlier
// install, not by the agent, so it does not count as using that agent.
async function hasOwnFiles(path) {
  const entries = await readdir(path, { withFileTypes: true }).catch(() => null);

  if (entries === null) {
    return existsSync(path);
  }

  for (const entry of entries) {
    const entryPath = resolve(path, entry.name);
    const isOwn = entry.isDirectory()
      ? await hasOwnFiles(entryPath)
      : !isGeneratedPointer(await readFile(entryPath, "utf8"));

    if (isOwn) {
      return true;
    }
  }

  return false;
}

export async function detectAgents(cwd) {
  const detected = [];

  for (const agent of agents) {
    for (const marker of agent.markers) {
      if (await hasOwnFiles(resolve(cwd, marker))) {
        detected.push(agent.id);
        break;
      }
    }
  }

  return detected;
}

export async function readInstallState(root, layout = installLayout(false)) {
  const path = layoutStateFile(layout);

  try {
    const state = JSON.parse(await readFile(resolve(root, path), "utf8"));

    return {
      version: typeof state.version === "string" ? state.version : undefined,
      skills: Array.isArray(state.skills) ? state.skills : [],
      agents: Array.isArray(state.agents)
        ? state.agents.filter((id) => agents.some((agent) => agent.id === id))
        : [],
    };
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(`Could not read ${path}: ${error.message}`);
  }
}

export async function writeInstallState(root, state, layout = installLayout(false)) {
  const path = resolve(root, layoutStateFile(layout));
  const content = {
    version: state.version,
    skills: [...new Set(state.skills)].sort(),
    agents: agents.map((agent) => agent.id).filter((id) => state.agents.includes(id)),
  };

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

export async function readInstalledVersion(root, layout = installLayout(false)) {
  try {
    return (await readFile(resolve(root, layout.skillsRoot, "VERSION"), "utf8")).trim();
  } catch {
    return undefined;
  }
}

export function findInstalledSkills(root, skills, layout = installLayout(false)) {
  return skills
    .map((skill) => skill.name)
    .filter((name) => existsSync(resolve(root, layout.skillsRoot, name, "SKILL.md")));
}

// Files the planned install would write that already exist, so the user
// decides once for all of them.
export function findExistingTargets(root, plan) {
  return plan
    .map((file) => file.target)
    .filter((target) => existsSync(resolve(root, target)));
}

// Generated pointer files for agents the project did not select. A file that
// no longer names its canonical SKILL.md was rewritten by hand and is kept.
export async function findPruneCandidates(cwd, skillNames, agentIds) {
  const candidates = [];

  for (const agent of adapterAgents) {
    if (agentIds.includes(agent.id)) continue;

    for (const skill of skillNames) {
      const target = agent.targetPath(skill);

      try {
        const content = await readFile(resolve(cwd, target), "utf8");

        if (content.includes(pointerMarker(skill))) {
          candidates.push({ agentId: agent.id, path: target });
        }
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }

  return candidates;
}

export async function removeFiles(cwd, paths) {
  const projectRoot = resolve(cwd);

  for (const path of paths) {
    const absolutePath = resolve(projectRoot, path);

    await rm(absolutePath, { force: true });

    let directory = dirname(absolutePath);

    while (
      directory !== projectRoot &&
      directory.startsWith(`${projectRoot}${sep}`) &&
      (await readdir(directory)).length === 0
    ) {
      await rmdir(directory);
      directory = dirname(directory);
    }
  }
}

// Every path installed skills may occupy in a project. Pointers for agents
// that were not selected are listed too, so a kept pointer stays private.
export function projectPaths(skillNames) {
  return [
    `${skillsRoot}/VERSION`,
    stateFile,
    ...skillNames.flatMap((skill) => [
      `${skillsRoot}/${skill}/`,
      ...adapterAgents.map((agent) => agent.targetPath(skill)),
    ]),
  ];
}

const excludeStart = "# >>> React Skills: installed for this clone only";
const excludeEnd = "# <<< React Skills";

// `.git/info/exclude` works like `.gitignore` but is never committed, so the
// skills stay on this machine without changing any file the team shares.
export function mergeExcludeBlock(content, patterns) {
  const lines = content.split(/\r?\n/);
  const start = lines.indexOf(excludeStart);
  const end = start < 0 ? -1 : lines.indexOf(excludeEnd, start);
  const kept = end < 0 ? lines : [...lines.slice(0, start), ...lines.slice(end + 1)];
  const block = patterns.length > 0 ? [excludeStart, ...patterns, excludeEnd].join("\n") : "";

  return `${[kept.join("\n").trim(), block].filter(Boolean).join("\n\n")}\n`;
}
