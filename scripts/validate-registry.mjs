import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = resolve(root, "registry.json");
const registry = JSON.parse(await readFile(registryPath, "utf8"));

if (registry.$schema !== "https://ui.shadcn.com/schema/registry.json") {
  throw new Error("registry.json must use the official shadcn schema");
}

const names = new Set();
const registeredFiles = new Set();
const dependencyFields = ["dependencies", "devDependencies"];
const publicationRoots = [
  "skills/manage-react-server-state",
  "cursor/manage-react-server-state.mdc",
];

async function listFiles(path) {
  const pathStat = await stat(path);

  if (pathStat.isFile()) {
    return [path];
  }

  const entries = await readdir(path, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => listFiles(resolve(path, entry.name))),
  );

  return nestedFiles.flat();
}

function toRegistryPath(path) {
  return relative(root, path).replaceAll("\\", "/");
}

function getDependencyRange(dependency) {
  const separatorIndex = dependency.lastIndexOf("@");

  return separatorIndex > 0 ? dependency.slice(separatorIndex + 1) : "";
}

for (const item of registry.items ?? []) {
  if (names.has(item.name)) {
    throw new Error(`Duplicate registry item: ${item.name}`);
  }
  names.add(item.name);

  for (const field of dependencyFields) {
    for (const dependency of item[field] ?? []) {
      if (!getDependencyRange(dependency).startsWith("^")) {
        throw new Error(
          `${item.name}:${field} must use a caret range: ${dependency}`,
        );
      }
    }
  }

  for (const file of item.files ?? []) {
    if (registeredFiles.has(file.path)) {
      throw new Error(`Duplicate registry file: ${file.path}`);
    }
    registeredFiles.add(file.path);

    const absoluteFilePath = resolve(root, file.path);
    await stat(absoluteFilePath);

    if (file.type === "registry:file" && !file.target) {
      throw new Error(`${item.name}:${file.path} requires a target`);
    }

    if (file.target?.startsWith("~/src/")) {
      throw new Error(
        `${item.name}:${file.path} must not install application source`,
      );
    }

    const featureExampleRoot =
      "skills/manage-react-server-state/examples/feature-colocated/src/features/";

    if (
      file.path.startsWith(featureExampleRoot) &&
      !file.path.startsWith(`${featureExampleRoot}posts/`)
    ) {
      throw new Error(
        `${item.name}:${file.path} is outside the canonical Posts example`,
      );
    }

    if (file.path.toLowerCase().includes("stream")) {
      throw new Error(`${item.name}:${file.path} must not publish a stream example`);
    }
  }
}

if (
  names.size !== 1 ||
  !names.has("manage-react-server-state")
) {
  throw new Error(
    "The registry must publish only the manage-react-server-state skill",
  );
}

const publishedFiles = (
  await Promise.all(
    publicationRoots.map((path) => listFiles(resolve(root, path))),
  )
)
  .flat()
  .map(toRegistryPath);

const missingRegistryFiles = publishedFiles.filter(
  (path) => !registeredFiles.has(path),
);
const unexpectedRegistryFiles = [...registeredFiles].filter(
  (path) => !publishedFiles.includes(path),
);

if (missingRegistryFiles.length > 0 || unexpectedRegistryFiles.length > 0) {
  throw new Error(
    [
      "registry.json publication files are out of sync.",
      missingRegistryFiles.length > 0
        ? `Missing: ${missingRegistryFiles.join(", ")}`
        : undefined,
      unexpectedRegistryFiles.length > 0
        ? `Unexpected: ${unexpectedRegistryFiles.join(", ")}`
        : undefined,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

await stat(resolve(root, ".github/workflows/release-skill.yml"));

const releaseConfigPath = resolve(root, ".releaserc.json");
const releaseConfig = JSON.parse(await readFile(releaseConfigPath, "utf8"));
const githubReleasePlugin = releaseConfig.plugins?.find(
  (plugin) =>
    Array.isArray(plugin) && plugin[0] === "@semantic-release/github",
);
const githubReleaseOptions = githubReleasePlugin?.[1];

if (
  !releaseConfig.branches?.includes("main") ||
  releaseConfig.tagFormat !== "manage-react-server-state-v${version}" ||
  githubReleaseOptions?.releaseNameTemplate !==
    "v<%= nextRelease.version %>" ||
  !githubReleaseOptions?.releaseBodyTemplate?.includes("### Changes") ||
  !githubReleaseOptions?.releaseBodyTemplate?.includes("### Install or update")
) {
  throw new Error("semantic-release naming or release details are invalid");
}

const skillPath = resolve(
  root,
  "skills/manage-react-server-state/SKILL.md",
);
const skill = (await readFile(skillPath, "utf8")).replaceAll("\r\n", "\n");

if (skill.includes("TODO")) {
  throw new Error("The Agent Skill still contains TODO placeholders");
}

if (!skill.startsWith("---\nname: manage-react-server-state\n")) {
  throw new Error("The Agent Skill frontmatter is missing or invalid");
}

console.log(
  `Validated ${names.size} registry items and the manage-react-server-state skill.`,
);
