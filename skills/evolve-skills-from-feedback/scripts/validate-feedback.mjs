#!/usr/bin/env node

import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const reportPath = process.argv[2]

if (!reportPath) {
  console.error("Usage: validate-feedback.mjs <feedback-report.md>")
  process.exit(1)
}

const content = (await readFile(resolve(reportPath), "utf8")).replaceAll(
  "\r\n",
  "\n"
)
const errors = []
const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/)

if (!frontmatterMatch) {
  errors.push("Report must start with YAML frontmatter.")
}

const metadata = new Map()

for (const line of frontmatterMatch?.[1].split("\n") ?? []) {
  const separator = line.indexOf(":")

  if (separator > 0) {
    metadata.set(
      line.slice(0, separator).trim(),
      line.slice(separator + 1).trim().replace(/^['\"]|['\"]$/g, "")
    )
  }
}

const requiredMetadata = [
  "feedback_version",
  "target_skill",
  "target_skill_version",
  "source_project",
  "captured_at",
  "status",
]

for (const key of requiredMetadata) {
  if (!metadata.get(key)) errors.push(`Missing frontmatter field: ${key}`)
}

if (metadata.get("feedback_version") !== "1") {
  errors.push("feedback_version must be 1.")
}

if (
  metadata.get("target_skill") &&
  !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.get("target_skill"))
) {
  errors.push("target_skill must use lowercase hyphen-case.")
}

if (
  metadata.get("captured_at") &&
  !/^\d{4}-\d{2}-\d{2}$/.test(metadata.get("captured_at"))
) {
  errors.push("captured_at must use YYYY-MM-DD.")
}

if (
  metadata.get("status") &&
  !["draft", "ready", "applied", "rejected"].includes(metadata.get("status"))
) {
  errors.push("status must be draft, ready, applied, or rejected.")
}

const requiredSections = [
  "## Executive Summary",
  "## Project Context",
  "## Findings",
  "## Cross-Cutting Decisions",
  "## Validation Requested",
]

for (const section of requiredSections) {
  if (!content.includes(section)) errors.push(`Missing section: ${section}`)
}

if (!/^# Skill Feedback: .+$/m.test(content)) {
  errors.push("Missing '# Skill Feedback: <target skill>' heading.")
}

const findingMatches = [...content.matchAll(/^### (F-\d{3}): .+$/gm)]

if (findingMatches.length === 0) {
  errors.push("Report must contain at least one F-### finding.")
}

const requiredFindingContent = [
  "- Category:",
  "- Severity:",
  "- Recurrence:",
  "- Confidence:",
  "#### Scenario",
  "#### Evidence",
  "#### Current behavior",
  "#### Preferred behavior",
  "#### Proposed skill change",
  "#### Generalization test",
  "#### Acceptance criteria",
]

for (const [index, finding] of findingMatches.entries()) {
  const start = finding.index
  const end = findingMatches[index + 1]?.index ?? content.indexOf(
    "## Cross-Cutting Decisions",
    start
  )
  const block = content.slice(start, end > start ? end : undefined)

  for (const required of requiredFindingContent) {
    if (!block.includes(required)) {
      errors.push(`${finding[1]} is missing: ${required}`)
    }
  }
}

if (/\{\{[^}]+\}\}/.test(content)) {
  errors.push("Report still contains template placeholders.")
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"))
  process.exit(1)
}

console.log(
  `Validated ${findingMatches.length} finding${findingMatches.length === 1 ? "" : "s"} in ${reportPath}.`
)
