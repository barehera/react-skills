import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = resolve(root, "skills");
const registrySchema = "https://ui.shadcn.com/schema/registry.json";
const dependencyFields = ["dependencies", "devDependencies"];

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

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

function toPosixPath(path) {
  return path.replaceAll("\\", "/");
}

function toRepositoryPath(path) {
  return toPosixPath(relative(root, path));
}

function isInside(parentPath, childPath) {
  const relativePath = relative(parentPath, childPath);

  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !isAbsolute(relativePath))
  );
}

function getDependencyRange(dependency) {
  const separatorIndex = dependency.lastIndexOf("@");

  return separatorIndex > 0 ? dependency.slice(separatorIndex + 1) : "";
}

async function loadRegistry(path, ancestry = new Set()) {
  const resolvedPath = resolve(path);

  if (ancestry.has(resolvedPath)) {
    throw new Error(`Circular registry include: ${toRepositoryPath(resolvedPath)}`);
  }

  const registry = await readJson(resolvedPath);

  if (registry.$schema !== registrySchema) {
    throw new Error(
      `${toRepositoryPath(resolvedPath)} must use the official shadcn schema`,
    );
  }

  const nextAncestry = new Set(ancestry);
  nextAncestry.add(resolvedPath);

  const includedItems = await Promise.all(
    (registry.include ?? []).map((includePath) =>
      loadRegistry(resolve(dirname(resolvedPath), includePath), nextAncestry),
    ),
  );

  return [
    ...(registry.items ?? []).map((item) => ({
      item,
      registryPath: resolvedPath,
    })),
    ...includedItems.flat(),
  ];
}

const rootRegistryPath = resolve(root, "registry.json");
const rootRegistry = await readJson(rootRegistryPath);

if (
  rootRegistry.$schema !== registrySchema ||
  rootRegistry.name !== "react-skills" ||
  rootRegistry.homepage !== "https://github.com/barehera/react-skills"
) {
  throw new Error("The root registry metadata must identify React Skills");
}

if ((rootRegistry.items ?? []).length > 0) {
  throw new Error("Define skill items in skill-local registries, not the root");
}

const skillDirectories = (await readdir(skillsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (skillDirectories.length === 0) {
  throw new Error("The React Skills catalog must contain at least one skill");
}

const expectedIncludes = skillDirectories.map(
  (skillName) => `skills/${skillName}/registry.json`,
);
const actualIncludes = [...(rootRegistry.include ?? [])].sort();

if (JSON.stringify(actualIncludes) !== JSON.stringify(expectedIncludes)) {
  throw new Error(
    "The root registry must include every skill-local registry exactly once",
  );
}

const resolvedItems = await loadRegistry(rootRegistryPath);
const itemNames = new Set();
const registeredFiles = new Set();

for (const { item, registryPath } of resolvedItems) {
  if (itemNames.has(item.name)) {
    throw new Error(`Duplicate registry item: ${item.name}`);
  }

  itemNames.add(item.name);

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name) ||
    item.name.length > 64
  ) {
    throw new Error(`Invalid skill name: ${item.name}`);
  }

  const skillDirectory = resolve(skillsRoot, item.name);
  const expectedRegistryPath = resolve(skillDirectory, "registry.json");

  if (registryPath !== expectedRegistryPath) {
    throw new Error(
      `${item.name} must be declared in skills/${item.name}/registry.json`,
    );
  }

  if (
    item.type !== "registry:item" ||
    !item.title ||
    !item.description ||
    !item.docs
  ) {
    throw new Error(`${item.name} requires complete registry metadata`);
  }

  for (const field of dependencyFields) {
    for (const dependency of item[field] ?? []) {
      if (!getDependencyRange(dependency).startsWith("^")) {
        throw new Error(
          `${item.name}:${field} must use a caret range: ${dependency}`,
        );
      }
    }
  }

  const itemFiles = new Set();

  for (const file of item.files ?? []) {
    const absoluteFilePath = resolve(dirname(registryPath), file.path);

    if (!isInside(skillDirectory, absoluteFilePath)) {
      throw new Error(`${item.name}:${file.path} must stay inside its skill folder`);
    }

    await stat(absoluteFilePath);

    const repositoryPath = toRepositoryPath(absoluteFilePath);

    if (registeredFiles.has(repositoryPath)) {
      throw new Error(`Duplicate registry file: ${repositoryPath}`);
    }

    registeredFiles.add(repositoryPath);
    itemFiles.add(repositoryPath);

    if (file.type === "registry:file" && !file.target) {
      throw new Error(`${item.name}:${file.path} requires a target`);
    }

    if (file.target?.startsWith("~/src/")) {
      throw new Error(
        `${item.name}:${file.path} must not install application source`,
      );
    }

    if (
      !file.path.startsWith("adapters/") &&
      !file.target?.startsWith(`~/.agents/skills/${item.name}/`)
    ) {
      throw new Error(
        `${item.name}:${file.path} must install inside its canonical skill folder`,
      );
    }
  }

  const expectedSkillFiles = (await listFiles(skillDirectory))
    .filter((path) => !["README.md", "registry.json"].includes(relative(skillDirectory, path)))
    .map(toRepositoryPath)
    .sort();
  const actualSkillFiles = [...itemFiles].sort();

  if (JSON.stringify(actualSkillFiles) !== JSON.stringify(expectedSkillFiles)) {
    const missing = expectedSkillFiles.filter((path) => !itemFiles.has(path));
    const unexpected = actualSkillFiles.filter(
      (path) => !expectedSkillFiles.includes(path),
    );

    throw new Error(
      [
        `${item.name} publication files are out of sync.`,
        missing.length > 0 ? `Missing: ${missing.join(", ")}` : undefined,
        unexpected.length > 0
          ? `Unexpected: ${unexpected.join(", ")}`
          : undefined,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  await stat(resolve(skillDirectory, "README.md"));
  await stat(resolve(skillDirectory, "agents/openai.yaml"));

  const skill = (
    await readFile(resolve(skillDirectory, "SKILL.md"), "utf8")
  ).replaceAll("\r\n", "\n");

  if (skill.includes("TODO")) {
    throw new Error(`${item.name}/SKILL.md contains TODO placeholders`);
  }

  if (!skill.startsWith(`---\nname: ${item.name}\n`)) {
    throw new Error(`${item.name}/SKILL.md frontmatter is missing or invalid`);
  }

  if (item.name === "manage-server-state") {
    for (const repositoryPath of itemFiles) {
      if (repositoryPath.toLowerCase().includes("stream")) {
        throw new Error(
          `${item.name}:${repositoryPath} must not publish a stream example`,
        );
      }
    }

    const featureExampleRoot =
      "skills/manage-server-state/examples/feature-colocated/src/features/";

    for (const repositoryPath of itemFiles) {
      if (
        repositoryPath.startsWith(featureExampleRoot) &&
        !repositoryPath.startsWith(`${featureExampleRoot}posts/`)
      ) {
        throw new Error(
          `${item.name}:${repositoryPath} is outside the canonical Posts example`,
        );
      }
    }
  }
}

if (
  itemNames.size !== skillDirectories.length ||
  skillDirectories.some((skillName) => !itemNames.has(skillName))
) {
  throw new Error("Every skill folder must publish exactly one matching item");
}

await stat(resolve(root, ".github/workflows/release.yml"));
await stat(resolve(root, "bin/react-skills.mjs"));
await stat(resolve(root, "docs/adding-a-skill.md"));

const packageJson = await readJson(resolve(root, "package.json"));

if (
  packageJson.name !== "react-skills" ||
  packageJson.bin?.["react-skills"] !== "./bin/react-skills.mjs"
) {
  throw new Error("package.json must expose the React Skills selector");
}

const releaseConfig = await readJson(resolve(root, ".releaserc.json"));
const githubReleasePlugin = releaseConfig.plugins?.find(
  (plugin) =>
    Array.isArray(plugin) && plugin[0] === "@semantic-release/github",
);
const githubReleaseOptions = githubReleasePlugin?.[1];

if (
  !releaseConfig.branches?.includes("main") ||
  releaseConfig.tagFormat !== "v${version}" ||
  githubReleaseOptions?.releaseNameTemplate !== "v<%= nextRelease.version %>" ||
  !githubReleaseOptions?.releaseBodyTemplate?.includes("### Changes") ||
  !githubReleaseOptions?.releaseBodyTemplate?.includes("### Choose and install")
) {
  throw new Error("React Skills release naming or details are invalid");
}

console.log(
  `Validated ${itemNames.size} skill${itemNames.size === 1 ? "" : "s"} in the React Skills catalog.`,
);
