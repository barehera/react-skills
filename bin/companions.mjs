// Third-party packs the installer can add next to React Skills. None installs
// without a choice: the selector asks, and a run without a terminal installs
// only the packs named with --companions. Packs are personal tools, so they
// install for the user, not into the project.
//
// Each pack installs through its own best channel per agent: a Claude Code
// plugin (with its hooks), the `npx skills` CLI for every other agent, or the
// pack's own CLI. Ponytail is not listed: its ladder and handoff lines already
// live in every skill's `Smallest complete change` section. claude-mem is not
// listed: the keep-project-memory skill replaces it with Markdown files.

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
  {
    id: "superpowers",
    label: "Superpowers",
    summary: "Brainstorm, plan, TDD, subagent workflow; its gates add steps to every task",
    plugin: {
      marketplace: "obra/superpowers-marketplace",
      name: "superpowers@superpowers-marketplace",
    },
    skills: "obra/superpowers",
  },
  {
    id: "caveman",
    label: "Caveman",
    summary: "Terse replies in every session; set DO_NOT_TRACK=1 for its CLI",
    plugin: { marketplace: "JuliusBrussee/caveman", name: "caveman@caveman" },
    skills: "JuliusBrussee/caveman",
  },
  {
    id: "graphify",
    label: "Graphify",
    summary: "Code knowledge graph in graphify-out/; needs uv (Python)",
    setup: [["uv", "tool", "install", "graphifyy"]],
    platforms: {
      claude: ["graphify", "install"],
      cursor: ["graphify", "cursor", "install"],
      codex: ["graphify", "install", "--platform", "codex"],
      copilot: ["graphify", "install", "--platform", "copilot"],
      gemini: ["graphify", "install", "--platform", "gemini"],
      opencode: ["graphify", "install", "--platform", "opencode"],
    },
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
  return agentIds.filter(
    (id) =>
      (id === "claude" && companion.plugin) ||
      companion.skills ||
      companion.platforms?.[id],
  );
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
    } else if (companion.platforms?.[id]) {
      steps.push(companion.platforms[id]);
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

  return {
    steps: steps.length > 0 && companion.setup ? [...companion.setup, ...steps] : steps,
    notes,
  };
}
