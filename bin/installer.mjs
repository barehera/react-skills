// Installer decisions without prompts or process spawning, so they can be
// tested against a temporary project folder.

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, rmdir, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";

import {
  adapterAgents,
  agentItemName,
  agents,
  pointerMarker,
  registryAddress,
  skillsRoot,
} from "./install-targets.mjs";

export const stateFile = `${skillsRoot}/react-skills.json`;

const passthroughFlags = new Map([
  ["--overwrite", "overwrite"],
  ["-o", "overwrite"],
  ["--prune", "prune"],
  ["--yes", "yes"],
  ["-y", "yes"],
  ["--dry-run", "dryRun"],
  ["--silent", "silent"],
  ["-s", "silent"],
  ["--all", "all"],
]);

export function parseArguments(argumentList, cwd = process.cwd()) {
  const options = {
    command: "install",
    skillNames: [],
    agentIds: [],
    all: false,
    cwd,
    overwrite: false,
    prune: false,
    yes: false,
    dryRun: false,
    silent: false,
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

    if (passthroughFlags.has(argument)) {
      options[passthroughFlags.get(argument)] = true;
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

  return [...(registry.items ?? []), ...included.flat()];
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

export function planItems(skillNames, agentIds) {
  const adapterIds = adapterAgents
    .filter((agent) => agentIds.includes(agent.id))
    .map((agent) => agent.id);

  return skillNames.flatMap((skill) => [
    `${registryAddress}/${skill}`,
    ...adapterIds.map((id) => `${registryAddress}/${agentItemName(skill, id)}`),
  ]);
}

export function agentLabels(agentIds) {
  return agents
    .filter((agent) => agentIds.includes(agent.id))
    .map((agent) => agent.label);
}

export function detectAgents(cwd) {
  return agents
    .filter((agent) => agent.markers.some((marker) => existsSync(resolve(cwd, marker))))
    .map((agent) => agent.id);
}

export async function readInstallState(cwd) {
  try {
    const state = JSON.parse(await readFile(resolve(cwd, stateFile), "utf8"));

    return {
      version: typeof state.version === "string" ? state.version : undefined,
      skills: Array.isArray(state.skills) ? state.skills : [],
      agents: Array.isArray(state.agents)
        ? state.agents.filter((id) => agents.some((agent) => agent.id === id))
        : [],
    };
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(`Could not read ${stateFile}: ${error.message}`);
  }
}

export async function writeInstallState(cwd, state) {
  const path = resolve(cwd, stateFile);
  const content = {
    version: state.version,
    skills: [...new Set(state.skills)].sort(),
    agents: agents.map((agent) => agent.id).filter((id) => state.agents.includes(id)),
  };

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

export async function readInstalledVersion(cwd) {
  try {
    return (await readFile(resolve(cwd, skillsRoot, "VERSION"), "utf8")).trim();
  } catch {
    return undefined;
  }
}

export function findInstalledSkills(cwd, skills) {
  return skills
    .map((skill) => skill.name)
    .filter((name) => existsSync(resolve(cwd, skillsRoot, name, "SKILL.md")));
}

// Files the planned install would write that already exist, so the user
// decides once instead of answering one shadcn prompt per file.
export function findExistingTargets(cwd, skills, skillNames, agentIds) {
  const targets = skills
    .filter((skill) => skillNames.includes(skill.name))
    .flatMap((skill) => [
      ...(skill.files ?? []).map((file) => file.target.replace(/^~\//, "")),
      ...adapterAgents
        .filter((agent) => agentIds.includes(agent.id))
        .map((agent) => agent.targetPath(skill.name)),
    ]);

  return targets.filter((target) => existsSync(resolve(cwd, target)));
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
