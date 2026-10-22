// Where React Skills installs. Shared by the installer, the package sync
// script, and the registry validator so the agent list exists once.

export const registryAddress = "barehera/react-skills";

export const skillsRoot = ".agents/skills";

// The editor decides which files are read, not the model picked inside it.
// Most agents read `.agents/skills` natively and need no extra file; the rest
// get one generated SKILL.md pointer in their own skills folder.
// `skillsAgent` is the agent id of the `npx skills` CLI used for companions.
const pointerAdapter = "adapters/pointer.md";

export const agents = [
  {
    id: "claude",
    label: "Claude Code",
    adapterPath: pointerAdapter,
    targetPath: (skill) => `.claude/skills/${skill}/SKILL.md`,
    markers: [".claude", "CLAUDE.md"],
    skillsAgent: "claude-code",
  },
  {
    id: "cursor",
    label: "Cursor",
    adapterPath: null,
    targetPath: null,
    markers: [".cursor", ".cursorrules"],
    skillsAgent: "cursor",
  },
  {
    id: "copilot",
    label: "GitHub Copilot",
    adapterPath: null,
    targetPath: null,
    markers: [".github/copilot-instructions.md", ".github/instructions", ".github/skills"],
    skillsAgent: "github-copilot",
  },
  {
    id: "windsurf",
    label: "Windsurf / Devin",
    adapterPath: null,
    targetPath: null,
    markers: [".windsurf", ".windsurfrules", ".devin"],
    skillsAgent: "windsurf",
  },
  {
    id: "codex",
    label: "Codex",
    adapterPath: null,
    targetPath: null,
    markers: [".codex", "AGENTS.md"],
    skillsAgent: "codex",
  },
  {
    id: "gemini",
    label: "Gemini CLI / Antigravity",
    adapterPath: null,
    targetPath: null,
    markers: [".gemini", "GEMINI.md"],
    skillsAgent: "gemini-cli",
  },
  {
    id: "opencode",
    label: "OpenCode",
    adapterPath: null,
    targetPath: null,
    markers: [".opencode", "opencode.json"],
    skillsAgent: "opencode",
  },
  {
    id: "kiro",
    label: "Kiro",
    adapterPath: pointerAdapter,
    targetPath: (skill) => `.kiro/skills/${skill}/SKILL.md`,
    markers: [".kiro"],
    skillsAgent: "kiro-cli",
  },
  {
    id: "cline",
    label: "Cline",
    adapterPath: pointerAdapter,
    targetPath: (skill) => `.cline/skills/${skill}/SKILL.md`,
    markers: [".cline", ".clinerules"],
    skillsAgent: "cline",
  },
];

export const adapterAgents = agents.filter((agent) => agent.adapterPath);

// Pointer files React Skills v4 and earlier wrote for agents that now read
// `.agents/skills` themselves. Updates remove them so a skill loads once.
export const legacyTargets = [
  (skill) => `.cursor/rules/${skill}.mdc`,
  (skill) => `.github/instructions/${skill}.instructions.md`,
  (skill) => `.windsurf/rules/${skill}.md`,
];

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
