import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = resolve(root, "skills");
const releaseVersionPath = resolve(root, "VERSION");
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

const [releaseItem] = rootRegistry.items ?? [];
const [releaseFile] = releaseItem?.files ?? [];

if (
  rootRegistry.items?.length !== 1 ||
  releaseItem?.name !== "react-skills-version" ||
  releaseItem?.type !== "registry:file" ||
  releaseItem?.files?.length !== 1 ||
  resolve(root, releaseFile?.path ?? "") !== releaseVersionPath ||
  releaseFile?.type !== "registry:file" ||
  releaseFile?.target !== "~/.agents/skills/VERSION"
) {
  throw new Error("The root registry must publish the shared release VERSION");
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
const resolvedSkillItems = resolvedItems.filter(
  ({ registryPath }) => registryPath !== rootRegistryPath,
);
const releaseVersion = (await readFile(releaseVersionPath, "utf8")).trim();
const itemNames = new Set();
const registeredFiles = new Set();

if (!/^\d+\.\d+\.\d+$/.test(releaseVersion)) {
  throw new Error("The root VERSION must use x.y.z format");
}

for (const { item, registryPath } of resolvedSkillItems) {
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

  if ((await readdir(skillDirectory)).includes("VERSION")) {
    throw new Error(
      `${item.name} must use the shared release version, not a skill-local VERSION`,
    );
  }

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

  if (item.meta?.version !== undefined) {
    throw new Error(
      `${item.name} must use the root release version, not meta.version`,
    );
  }

  if (
    !item.registryDependencies?.includes(
      "barehera/react-skills/react-skills-version",
    )
  ) {
    throw new Error(
      `${item.name} must depend on the shared React Skills version item`,
    );
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
    const exampleUtils = await readFile(
      resolve(
        skillDirectory,
        "examples/feature-colocated/src/server-state/utils.ts",
      ),
      "utf8",
    );
    const parseApiPayloadStart = exampleUtils.indexOf(
      "export function parseApiPayload",
    );
    const parseApiPayloadEnd = exampleUtils.indexOf(
      "export function mergeQueryOptions",
      parseApiPayloadStart,
    );
    const parseApiPayloadExample = exampleUtils.slice(
      parseApiPayloadStart,
      parseApiPayloadEnd,
    );

    if (
      parseApiPayloadStart < 0 ||
      parseApiPayloadEnd < 0 ||
      !parseApiPayloadExample.includes("new ApiRequestError") ||
      !parseApiPayloadExample.includes("return value as TOutput") ||
      !parseApiPayloadExample.includes("console.warn") ||
      parseApiPayloadExample.includes("throw new ApiRequestError")
    ) {
      throw new Error(
        `${item.name} must report schema drift without rejecting the query`,
      );
    }

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
const installer = await readFile(resolve(root, "bin/react-skills.mjs"), "utf8");
await stat(resolve(root, "docs/adding-a-skill.md"));
await stat(resolve(root, "scripts/sync-release-version.mjs"));

if (
  !installer.includes('type: "multiselect"') ||
  !installer.includes("Space to select. A to toggle all. Enter to submit.")
) {
  throw new Error("The React Skills installer must expose a multi-select UI");
}

const packageJson = await readJson(resolve(root, "package.json"));
const packageLock = await readJson(resolve(root, "package-lock.json"));

if (
  packageJson.name !== "react-skills" ||
  packageJson.bin?.["react-skills"] !== "./bin/react-skills.mjs" ||
  !packageJson.files?.includes("VERSION") ||
  packageJson.version !== releaseVersion ||
  packageLock.version !== releaseVersion ||
  packageLock.packages?.[""]?.version !== releaseVersion
) {
  throw new Error(
    "VERSION, package.json, and package-lock.json must match the release",
  );
}

const releaseConfig = await readJson(resolve(root, ".releaserc.json"));
const githubReleasePlugin = releaseConfig.plugins?.find(
  (plugin) =>
    Array.isArray(plugin) && plugin[0] === "@semantic-release/github",
);
const execReleasePlugin = releaseConfig.plugins?.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === "@semantic-release/exec",
);
const gitReleasePlugin = releaseConfig.plugins?.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === "@semantic-release/git",
);
const githubReleaseOptions = githubReleasePlugin?.[1];
const execReleaseOptions = execReleasePlugin?.[1];
const gitReleaseOptions = gitReleasePlugin?.[1];
const gitReleaseAssets = new Set(gitReleaseOptions?.assets ?? []);
const execReleaseIndex = releaseConfig.plugins?.indexOf(execReleasePlugin);
const gitReleaseIndex = releaseConfig.plugins?.indexOf(gitReleasePlugin);
const githubReleaseIndex = releaseConfig.plugins?.indexOf(githubReleasePlugin);

if (
  !releaseConfig.branches?.includes("main") ||
  releaseConfig.tagFormat !== "v${version}" ||
  execReleaseIndex < 0 ||
  gitReleaseIndex <= execReleaseIndex ||
  githubReleaseIndex <= gitReleaseIndex ||
  !execReleaseOptions?.prepareCmd?.includes(
    "release:sync-version -- ${nextRelease.version}",
  ) ||
  !execReleaseOptions?.prepareCmd?.includes("npm run validate") ||
  !gitReleaseAssets.has("VERSION") ||
  !gitReleaseAssets.has("package.json") ||
  !gitReleaseAssets.has("package-lock.json") ||
  !gitReleaseOptions?.message?.includes("[skip ci]") ||
  githubReleaseOptions?.releaseNameTemplate !== "v<%= nextRelease.version %>" ||
  !githubReleaseOptions?.releaseBodyTemplate?.includes("### Changes") ||
  !githubReleaseOptions?.releaseBodyTemplate?.includes("### Choose and install")
) {
  throw new Error("React Skills release automation is incomplete or invalid");
}

for (const dependency of ["@semantic-release/exec", "@semantic-release/git"]) {
  if (!packageJson.devDependencies?.[dependency]?.startsWith("^")) {
    throw new Error(`${dependency} must be installed with a caret range`);
  }
}

if (!packageJson.dependencies?.prompts?.startsWith("^")) {
  throw new Error("prompts must be installed as a runtime caret dependency");
}

console.log(
  `Validated ${itemNames.size} skill${itemNames.size === 1 ? "" : "s"} in the React Skills catalog.`,
);
