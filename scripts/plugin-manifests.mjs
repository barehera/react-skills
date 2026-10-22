// Plugin and extension manifests that let each agent install the whole catalog
// from this repository. Every one carries the release version, which the
// release script writes and the validator checks.

export const pluginManifests = [
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  ".cursor-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".github/plugin/plugin.json",
  ".github/plugin/marketplace.json",
  "gemini-extension.json",
];

// Skills read `../VERSION`, which is `.agents/skills/VERSION` in a project
// install and this file in a plugin install.
export const pluginVersionFile = "skills/VERSION";

// A marketplace has no version of its own, only its plugin entries do.
export function manifestVersions(manifest) {
  return [manifest, ...(manifest.plugins ?? [])]
    .filter((entry) => "version" in entry)
    .map((entry) => entry.version);
}

export function withVersion(manifest, version) {
  const stamp = (entry) => ("version" in entry ? { ...entry, version } : entry);

  return {
    ...stamp(manifest),
    ...(manifest.plugins && { plugins: manifest.plugins.map(stamp) }),
  };
}
