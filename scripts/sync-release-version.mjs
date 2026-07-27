import { execFileSync } from "node:child_process";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = resolve(root, "skills");

function readLatestReleaseVersion() {
  const tag = execFileSync(
    "git",
    ["describe", "--tags", "--match", "v[0-9]*", "--abbrev=0"],
    {
      cwd: root,
      encoding: "utf8",
    },
  ).trim();

  return tag.replace(/^v/, "");
}

const version = process.argv[2] ?? readLatestReleaseVersion();

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`Release version must use x.y.z format: ${version}`);
}

const skillDirectories = (await readdir(skillsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const skillName of skillDirectories) {
  const skillDirectory = resolve(skillsRoot, skillName);
  const registryPath = resolve(skillDirectory, "registry.json");
  const registry = JSON.parse(await readFile(registryPath, "utf8"));

  registry.items = (registry.items ?? []).map((item) => ({
    ...item,
    meta: {
      ...item.meta,
      version,
    },
  }));

  await Promise.all([
    writeFile(resolve(skillDirectory, "VERSION"), `${version}\n`),
    writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`),
  ]);
}

console.log(
  `Synchronized ${skillDirectories.length} skill${skillDirectories.length === 1 ? "" : "s"} to React Skills v${version}.`,
);
