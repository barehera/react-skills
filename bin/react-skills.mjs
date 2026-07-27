#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import prompts from "prompts";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = resolve(packageRoot, "registry.json");
const versionPath = resolve(packageRoot, "VERSION");
const repositoryAddress = "barehera/react-skills";

async function readRegistry(path, visited = new Set()) {
  const resolvedPath = resolve(path);

  if (visited.has(resolvedPath)) {
    throw new Error(`Circular registry include: ${resolvedPath}`);
  }

  visited.add(resolvedPath);

  const registry = JSON.parse(await readFile(resolvedPath, "utf8"));
  const includedItems = await Promise.all(
    (registry.include ?? []).map((includePath) =>
      readRegistry(resolve(dirname(resolvedPath), includePath), visited),
    ),
  );

  return [...(registry.items ?? []), ...includedItems.flat()];
}

function printHelp() {
  console.log(`React Skills

Select and install Agent Skills from ${repositoryAddress}.

Usage:
  npx --yes github:${repositoryAddress}          Open the skill selector
  npx --yes github:${repositoryAddress} <skill...> [options]

Selector:
  Arrow keys         Move between skills
  Space              Select or clear a skill
  A                  Toggle every skill
  Enter              Install selected skills

Options:
  --list             List available skills without installing
  --all              Select every available skill
  --cwd <path>       Install into a different project
  --overwrite        Overwrite existing skill files
  --yes              Skip the shadcn confirmation
  --dry-run          Preview the installation
  --silent           Reduce shadcn output
  --help             Show this help
`);
}

function printCatalog(items, releaseVersion) {
  console.log("\nAvailable React Skills\n");

  items.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.title ?? item.name} v${releaseVersion}`,
    );
    console.log(`   ${item.description ?? item.name}`);
    console.log(`   ${item.name}\n`);
  });
}

function parseArguments(arguments_) {
  const selectedNames = [];
  const shadcnArguments = [];
  let installAll = false;
  let listOnly = false;
  let cwd = process.cwd();

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];

    if (argument === "--help" || argument === "-h") {
      return { help: true };
    }

    if (argument === "--list") {
      listOnly = true;
      continue;
    }

    if (argument === "--all") {
      installAll = true;
      continue;
    }

    if (argument === "--cwd" || argument === "-c") {
      const value = arguments_[index + 1];

      if (!value) {
        throw new Error(`${argument} requires a value`);
      }

      cwd = resolve(process.cwd(), value);
      index += 1;
      continue;
    }

    if (
      ["--overwrite", "-o", "--yes", "-y", "--dry-run", "--silent", "-s"].includes(
        argument,
      )
    ) {
      shadcnArguments.push(argument);
      continue;
    }

    if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    }

    selectedNames.push(argument);
  }

  return {
    help: false,
    cwd,
    installAll,
    listOnly,
    selectedNames,
    shadcnArguments,
  };
}

function resolveSelections(selection, items) {
  const tokens = selection
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.some((token) => token.toLowerCase() === "all")) {
    return items;
  }

  const selectedItems = tokens.map((token) => {
    const numericIndex = Number(token);

    if (Number.isInteger(numericIndex) && numericIndex >= 1) {
      return items[numericIndex - 1];
    }

    return items.find((item) => item.name === token);
  });

  if (selectedItems.some((item) => !item)) {
    throw new Error("Select skills by number, exact name, or \"all\".");
  }

  return [...new Map(selectedItems.map((item) => [item.name, item])).values()];
}

async function selectInteractively(items, releaseVersion) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "Interactive selection needs a terminal. Pass a skill name, --all, or --list.",
    );
  }

  let cancelled = false;
  const { selectedNames = [] } = await prompts(
    {
      type: "multiselect",
      name: "selectedNames",
      message: "Which skills would you like to install?",
      hint: "Space to select. A to toggle all. Enter to submit.",
      instructions: false,
      choices: items.map((item) => ({
        title: `${item.title ?? item.name} v${releaseVersion}`,
        value: item.name,
      })),
    },
    {
      onCancel() {
        cancelled = true;
        return false;
      },
    },
  );

  if (cancelled) {
    return null;
  }

  return selectedNames.map((name) =>
    items.find((item) => item.name === name),
  );
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const [registryItems, releaseVersion] = await Promise.all([
    readRegistry(registryPath),
    readFile(versionPath, "utf8").then((value) => value.trim()),
  ]);
  const items = registryItems.filter((item) => item.type === "registry:item");

  if (items.length === 0) {
    throw new Error("The React Skills catalog is empty.");
  }

  if (options.listOnly) {
    printCatalog(items, releaseVersion);
    return;
  }

  let selectedItems;

  if (options.installAll) {
    selectedItems = items;
  } else if (options.selectedNames.length > 0) {
    selectedItems = resolveSelections(options.selectedNames.join(","), items);
  } else {
    selectedItems = await selectInteractively(items, releaseVersion);
  }

  if (selectedItems === null) {
    console.log("\nInstallation cancelled.\n");
    return;
  }

  if (selectedItems.length === 0) {
    console.log("\nNo skills selected. Exiting.\n");
    return;
  }

  const itemAddresses = selectedItems.map(
    (item) => `${repositoryAddress}/${item.name}`,
  );

  console.log(
    `\nInstalling ${selectedItems.map((item) => item.name).join(", ")}...\n`,
  );

  const commandArguments = [
    "--yes",
    "shadcn@latest",
    "add",
    ...itemAddresses,
    ...options.shadcnArguments,
  ];
  const result =
    process.platform === "win32"
      ? spawnSync(["npx", ...commandArguments].join(" "), {
          cwd: options.cwd,
          shell: true,
          stdio: "inherit",
        })
      : spawnSync("npx", commandArguments, {
          cwd: options.cwd,
          stdio: "inherit",
        });

  if (result.error) {
    throw result.error;
  }

  process.exitCode = result.status ?? 1;
}

main().catch((error) => {
  console.error(`\nReact Skills: ${error.message}`);
  process.exitCode = 1;
});
