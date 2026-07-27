import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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

const packagePath = resolve(root, "package.json");
const packageLockPath = resolve(root, "package-lock.json");
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
const packageLock = JSON.parse(await readFile(packageLockPath, "utf8"));

packageJson.version = version;
packageLock.version = version;

if (packageLock.packages?.[""]) {
  packageLock.packages[""].version = version;
}

await Promise.all([
  writeFile(resolve(root, "VERSION"), `${version}\n`),
  writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`),
  writeFile(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`),
]);

console.log(`Synchronized React Skills to v${version}.`);
