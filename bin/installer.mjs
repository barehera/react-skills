// Installer decisions without prompts or process spawning, so they can be
// tested against a temporary project folder.

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, rmdir, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";

import { companions, parseCompanionIds } from "./companions.mjs";
import {
  adapterAgents,
  agentItemName,
  agents,
  isGeneratedPointer,
  legacyTargets,
  pointerMarker,
  registryAddress,
  skillsRoot,
} from "./install-targets.mjs";

export const stateFile = `${skillsRoot}/thinstack.json`;
// Releases before v6 were named React Skills and saved the selection here. It
// is read when the new file is missing and removed on the next save.
export const legacyStateFile = `${skillsRoot}/react-skills.json`;

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
  ["--global", "global"],
  ["-g", "global"],
]);

export function parseArguments(argumentList, cwd = process.cwd()) {
  const options = {
    command: "install",
    skillNames: [],
    agentIds: [],
    // null until --companions names packs; an empty list means none.
    companionIds: null,
    all: false,
    global: false,
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

    if (argument === "--companions" || argument === "--companion") {
      const value = argumentList[index + 1];

      if (!value || value.startsWith("-")) {
        throw new Error(`${argument} requires a value`);
      }

      options.companionIds = [...new Set([...(options.companionIds ?? []), ...parseCompanionIds(value)])];
      index += 1;
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

  if (options.global && resolve(options.cwd) !== resolve(cwd)) {
    throw new Error("--global installs for your user in every project; drop --cwd.");
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

// A global install goes through the skills CLI, which knows every agent's user
// skills folder and links each one to the shared copy in `~/.agents/skills`.
export function globalSkillsCommand(skillNames, agentIds) {
  return [
    "npx",
    "--yes",
    "skills",
    "add",
    registryAddress,
    "--skill",
    ...skillNames,
    "--agent",
    ...agents.filter((agent) => agentIds.includes(agent.id)).map((agent) => agent.skillsAgent),
    "--global",
    "--yes",
  ];
}

// Skills read `../VERSION`, so every user skills folder a global install
// writes to gets the release next to the skills.
export function globalVersionPaths(agentIds) {
  return [
    ...new Set([
      skillsRoot,
      ...agents.filter((agent) => agentIds.includes(agent.id)).map((agent) => agent.globalRoot),
    ]),
  ].map((root) => `${root}/VERSION`);
}

export function agentLabels(agentIds) {
  return agents
    .filter((agent) => agentIds.includes(agent.id))
    .map((agent) => agent.label);
}

// A folder that holds only Thinstack pointers was created by an earlier
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

export async function readInstallState(cwd) {
  return (await readStateFile(cwd, stateFile)) ?? (await readStateFile(cwd, legacyStateFile));
}

async function readStateFile(cwd, file) {
  try {
    const state = JSON.parse(await readFile(resolve(cwd, file), "utf8"));

    return {
      version: typeof state.version === "string" ? state.version : undefined,
      skills: Array.isArray(state.skills) ? state.skills : [],
      agents: Array.isArray(state.agents)
        ? state.agents.filter((id) => agents.some((agent) => agent.id === id))
        : [],
      companions: Array.isArray(state.companions)
        ? state.companions.filter((id) => companions.some((companion) => companion.id === id))
        : [],
    };
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(`Could not read ${file}: ${error.message}`);
  }
}

export async function writeInstallState(cwd, state) {
  const path = resolve(cwd, stateFile);
  const content = {
    version: state.version,
    skills: [...new Set(state.skills)].sort(),
    agents: agents.map((agent) => agent.id).filter((id) => state.agents.includes(id)),
    companions: companions
      .map((companion) => companion.id)
      .filter((id) => (state.companions ?? []).includes(id)),
  };

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await rm(resolve(cwd, legacyStateFile), { force: true });
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

// Pointers an earlier release generated for agents that now read the
// canonical folder. A file rewritten by hand no longer names its skill and is kept.
export async function findLegacyPointers(cwd, skillNames) {
  const found = [];

  for (const targetPath of legacyTargets) {
    for (const skill of skillNames) {
      const target = targetPath(skill);

      try {
        if ((await readFile(resolve(cwd, target), "utf8")).includes(pointerMarker(skill))) {
          found.push(target);
        }
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }

  return found;
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
// that were not selected are listed too, so a kept pointer stays local.
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

const excludeStart = "# >>> Thinstack: installed for this clone only";
const excludeEnd = "# <<< Thinstack";
// The block React Skills wrote before v6; a merge replaces it with the new one.
const legacyExcludeStart = "# >>> React Skills: installed for this clone only";
const legacyExcludeEnd = "# <<< React Skills";

function withoutBlock(lines, startLine, endLine) {
  const start = lines.indexOf(startLine);
  const end = start < 0 ? -1 : lines.indexOf(endLine, start);

  return end < 0 ? lines : [...lines.slice(0, start), ...lines.slice(end + 1)];
}

// `.git/info/exclude` works like `.gitignore` but is never committed, so the
// skills stay on this machine without changing any file the team shares.
export function mergeExcludeBlock(content, patterns) {
  const kept = withoutBlock(
    withoutBlock(content.split(/\r?\n/), excludeStart, excludeEnd),
    legacyExcludeStart,
    legacyExcludeEnd,
  );
  const block = patterns.length > 0 ? [excludeStart, ...patterns, excludeEnd].join("\n") : "";

  return `${[kept.join("\n").trim(), block].filter(Boolean).join("\n\n")}\n`;
}
