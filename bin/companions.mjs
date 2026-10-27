// Third-party packs the installer can add next to React Skills. None installs
// without a choice: the selector asks, and a run without a terminal installs
// only the packs named with --companions. Packs are personal tools, so they
// install for the user, not into the project.
//
// Each pack installs through its own best channel per agent: a Claude Code
// plugin (with its hooks), or the `npx skills` CLI for every other agent.
// Ponytail is not listed: its ladder and handoff lines already live in every
// skill's `Smallest complete change` section. claude-mem, Superpowers,
// Caveman, and Graphify are not listed: keep-project-memory, verify-and-report,
// debug-from-root-cause, and map-project-modules keep their useful ideas in
// plain files, without their hooks and runtimes.

import { agents } from "./install-targets.mjs";

export const companions = [
  {
    id: "karpathy",
    label: "Karpathy guidelines",
    summary: "Think first, simplest code, surgical diffs, verifiable goals",
    recommended: true,
    plugin: {
      marketplace: "forrestchang/andrej-karpathy-skills",
      name: "andrej-karpathy-skills@karpathy-skills",
    },
    skills: "forrestchang/andrej-karpathy-skills",
  },
];

export const recommendedCompanions = companions
  .filter((companion) => companion.recommended)
  .map((companion) => companion.id);

export function parseCompanionIds(value) {
  const ids = value
    .split(",")
    .map((id) => id.trim().toLowerCase())
    .filter(Boolean);

  if (ids.includes("none")) {
    return [];
  }

  const unknown = ids.filter((id) => !companions.some((companion) => companion.id === id));

  if (unknown.length > 0) {
    throw new Error(
      `Unknown companion: ${unknown.join(", ")}. Choose from ${companions.map((companion) => companion.id).join(", ")}, or none.`,
    );
  }

  return [...new Set(ids)];
}

export function supportedAgents(companion, agentIds) {
  return agentIds.filter((id) => (id === "claude" && companion.plugin) || companion.skills);
}

export function pluginSlashCommands(companion) {
  return [
    `/plugin marketplace add ${companion.plugin.marketplace}`,
    `/plugin install ${companion.plugin.name}`,
  ];
}

// The commands that install one pack for the selected agents. Without the
// `claude` command, Claude Code takes the pack's skills through `npx skills`
// and `notes` names the plugin commands that add its hooks too.
export function companionPlan(companion, agentIds, { hasClaudeCli }) {
  const steps = [];
  const notes = [];
  const viaSkills = [];

  for (const id of supportedAgents(companion, agentIds)) {
    if (id === "claude" && companion.plugin && hasClaudeCli) {
      steps.push(
        ["claude", "plugin", "marketplace", "add", companion.plugin.marketplace, "--scope", "user"],
        ["claude", "plugin", "install", companion.plugin.name, "--scope", "user"],
      );
    } else if (companion.skills) {
      viaSkills.push(id);
    } else {
      notes.push(...pluginSlashCommands(companion));
    }
  }

  if (viaSkills.length > 0) {
    steps.push([
      "npx",
      "--yes",
      "skills",
      "add",
      companion.skills,
      "--skill",
      "*",
      "--agent",
      ...agents.filter((agent) => viaSkills.includes(agent.id)).map((agent) => agent.skillsAgent),
      "--global",
      "--yes",
    ]);

    if (viaSkills.includes("claude") && companion.plugin) {
      notes.push(...pluginSlashCommands(companion));
    }
  }

  return { steps, notes };
}
