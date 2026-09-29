// Where React Skills installs. Shared by the installer, the package sync
// script, and the registry validator so the agent list exists once.

export const registryAddress = "barehera/react-skills";

export const skillsRoot = ".agents/skills";

// A global install serves every project from the home folder. Claude Code is
// the agent that reads skills there, so it gets the canonical skill directly.
export const globalSkillsRoot = ".claude/skills";

// Every agent reads the canonical skill folder. An agent with an adapter also
// gets one generated pointer file; Codex reads the canonical folder directly.
export const agents = [
  {
    id: "claude",
    label: "Claude Code",
    adapterPath: "adapters/claude.md",
    targetPath: (skill) => `.claude/skills/${skill}/SKILL.md`,
    markers: [".claude"],
  },
  {
    id: "cursor",
    label: "Cursor",
    adapterPath: "adapters/cursor.mdc",
    targetPath: (skill) => `.cursor/rules/${skill}.mdc`,
    markers: [".cursor", ".cursorrules"],
  },
  {
    id: "copilot",
    label: "GitHub Copilot",
    adapterPath: "adapters/copilot.instructions.md",
    targetPath: (skill) => `.github/instructions/${skill}.instructions.md`,
    markers: [".github/copilot-instructions.md", ".github/instructions"],
  },
  {
    id: "windsurf",
    label: "Windsurf",
    adapterPath: "adapters/windsurf.md",
    targetPath: (skill) => `.windsurf/rules/${skill}.md`,
    markers: [".windsurf", ".windsurfrules"],
  },
  {
    id: "codex",
    label: "Codex",
    adapterPath: null,
    targetPath: null,
    markers: [".codex", "AGENTS.md"],
  },
];

export const adapterAgents = agents.filter((agent) => agent.adapterPath);

export function agentItemName(skill, agentId) {
  return `${skill}-${agentId}`;
}

// A generated pointer always names its canonical SKILL.md; the installer only
// removes adapter files that still contain it.
export function pointerMarker(skill) {
  return `${skillsRoot}/${skill}/SKILL.md`;
}

export function isGeneratedPointer(content) {
  return /Read and follow `\.agents\/skills\/[a-z0-9-]+\/SKILL\.md`/.test(content);
}
