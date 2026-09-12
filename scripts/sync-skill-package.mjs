// Regenerates the per-agent adapters and the registry `files` list of every
// skill from the skill folder itself, so a new or changed skill never ships an
// incomplete adapter set or an out-of-sync registry item.
//
// Usage: node scripts/sync-skill-package.mjs [--check]
//   --check  exit non-zero instead of writing when something is out of date.

import { readdir, readFile, stat, writeFile, mkdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = resolve(root, "skills");
const checkOnly = process.argv.includes("--check");

// File globs that make an editor rule attach to the code a skill owns. A skill
// without an entry falls back to every TypeScript file.
const skillGlobs = {
  "build-composable-components": ["**/components/**/*.{ts,tsx}"],
  "build-forms": ["**/form*/**/*.{ts,tsx}", "**/*-form.{ts,tsx}"],
  "manage-server-state": [
    "**/server-state/**/*.{ts,tsx}",
    "**/*query*.{ts,tsx}",
    "**/*mutation*.{ts,tsx}",
  ],
  "document-business-logic": ["**/*.{ts,tsx}"],
  "evolve-skills-from-feedback": ["**/.agents/feedback/**/*.md", "**/skills/**/SKILL.md"],
  "feature-sliced-design": ["**/src/**/*.{ts,tsx}", "**/app/**/*.{ts,tsx}"],
  "extract-named-helpers": ["**/*.{ts,tsx}"],
  "use-preferred-react-stack": ["**/*.{ts,tsx}", "**/package.json"],
};

const defaultGlobs = ["**/*.{ts,tsx}"];

// Published path inside the skill folder → install target. Adapters are the
// only files allowed to install outside `~/.agents/skills/<name>/`.
const adapterTargets = {
  "adapters/claude.md": (name) => `~/.claude/skills/${name}/SKILL.md`,
  "adapters/cursor.mdc": (name) => `~/.cursor/rules/${name}.mdc`,
  "adapters/copilot.instructions.md": (name) =>
    `~/.github/instructions/${name}.instructions.md`,
  "adapters/windsurf.md": (name) => `~/.windsurf/rules/${name}.md`,
};

const requiredAdapterPaths = Object.keys(adapterTargets);

function toPosixPath(path) {
  return path.replaceAll("\\", "/");
}

async function listFiles(path) {
  const pathStat = await stat(path);

  if (pathStat.isFile()) {
    return [path];
  }

  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => listFiles(resolve(path, entry.name))),
  );

  return nested.flat();
}

function readFrontmatterField(markdown, field) {
  const match = markdown.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));

  return match ? match[1].trim() : "";
}

function readYamlString(yaml, field) {
  const match = yaml.match(new RegExp(`${field}:\\s*"([^"]*)"`));

  return match ? match[1] : "";
}

function quoteYaml(value) {
  return JSON.stringify(value);
}

function pointerBody(name, shortDescription) {
  return [
    `Read and follow \`.agents/skills/${name}/SKILL.md\`, and the references,`,
    "examples, and companion routing it names, before starting.",
    ...(shortDescription ? ["", `Purpose: ${shortDescription}.`] : []),
    "",
    "- Inspect the repository before changing it; preserve a coherent existing",
    "  structure and treat the bundled examples as references, never as templates.",
    "- Keep primitives, composable families, and feature adapters in separate",
    "  layers with dependencies pointing downward only.",
    "- Route work the skill does not own to the companion skill it names.",
    "- Report `React Skills v<version>` from `.agents/skills/VERSION` in the",
    "  final handoff.",
    "",
  ].join("\n");
}

function renderAdapters({ name, description, shortDescription, globs }) {
  const body = pointerBody(name, shortDescription);

  return {
    "adapters/claude.md": [
      "---",
      `name: ${name}`,
      `description: ${description}`,
      "---",
      "",
      body,
    ].join("\n"),
    "adapters/cursor.mdc": [
      "---",
      `description: ${description}`,
      "globs:",
      ...globs.map((glob) => `  - ${quoteYaml(glob)}`),
      "alwaysApply: false",
      "---",
      "",
      body,
    ].join("\n"),
    "adapters/copilot.instructions.md": [
      "---",
      `applyTo: ${quoteYaml(globs.join(", "))}`,
      "---",
      "",
      body,
    ].join("\n"),
    "adapters/windsurf.md": [
      "---",
      "trigger: glob",
      `globs: ${quoteYaml(globs.join(", "))}`,
      "---",
      "",
      body,
    ].join("\n"),
  };
}

function fileOrder(path) {
  if (path === "SKILL.md") return 0;
  if (path.startsWith("agents/")) return 1;
  if (path.startsWith("references/")) return 2;
  if (path.startsWith("examples/")) return 3;
  if (path.startsWith("scripts/")) return 4;
  if (path.startsWith("assets/")) return 5;
  if (path.startsWith("adapters/")) return 6;
  return 7;
}

function registryFiles(name, paths) {
  return [...paths]
    .sort((a, b) => fileOrder(a) - fileOrder(b) || a.localeCompare(b))
    .map((path) => ({
      path,
      type: "registry:file",
      target: adapterTargets[path]
        ? adapterTargets[path](name)
        : `~/.agents/skills/${name}/${path}`,
    }));
}

async function syncFile(path, content) {
  let current;

  try {
    current = (await readFile(path, "utf8")).replaceAll("\r\n", "\n");
  } catch {
    current = undefined;
  }

  if (current === content) {
    return false;
  }

  if (checkOnly) {
    return true;
  }

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");

  return true;
}

const skillNames = (await readdir(skillsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const changed = [];

for (const name of skillNames) {
  const skillDirectory = resolve(skillsRoot, name);
  const skill = (
    await readFile(resolve(skillDirectory, "SKILL.md"), "utf8")
  ).replaceAll("\r\n", "\n");
  const agentMetadata = await readFile(
    resolve(skillDirectory, "agents/openai.yaml"),
    "utf8",
  );
  const description = readFrontmatterField(skill, "description");

  if (!description) {
    throw new Error(`${name}/SKILL.md must declare a description`);
  }

  const adapters = renderAdapters({
    name,
    description,
    shortDescription: readYamlString(agentMetadata, "short_description"),
    globs: skillGlobs[name] ?? defaultGlobs,
  });

  for (const [path, content] of Object.entries(adapters)) {
    if (await syncFile(resolve(skillDirectory, path), content)) {
      changed.push(`skills/${name}/${path}`);
    }
  }

  const registryPath = resolve(skillDirectory, "registry.json");
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  const item = registry.items?.[0];

  if (!item || item.name !== name) {
    throw new Error(`skills/${name}/registry.json must declare item ${name}`);
  }

  const publishedPaths = (await listFiles(skillDirectory))
    .map((path) => toPosixPath(relative(skillDirectory, path)))
    .filter((path) => !["README.md", "registry.json"].includes(path));

  if (checkOnly) {
    for (const path of requiredAdapterPaths) {
      if (!publishedPaths.includes(path)) {
        publishedPaths.push(path);
      }
    }
  }

  item.files = registryFiles(name, publishedPaths);

  const registryContent = `${JSON.stringify(registry, null, 2)}\n`;

  if (await syncFile(registryPath, registryContent)) {
    changed.push(`skills/${name}/registry.json`);
  }
}

if (changed.length === 0) {
  console.log(`Skill adapters and registry files are in sync for ${skillNames.length} skills.`);
} else if (checkOnly) {
  console.error(
    ["Skill packages are out of sync. Run `npm run skills:sync`:", ...changed].join(
      "\n  ",
    ),
  );
  process.exit(1);
} else {
  console.log(["Updated:", ...changed].join("\n  "));
}
