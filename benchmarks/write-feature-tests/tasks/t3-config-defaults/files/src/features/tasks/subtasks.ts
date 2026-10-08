import { loadBakedConfig } from "@/config/remote-config"

export type WorkspacePlan = "free" | "team" | "enterprise"

// Business Logic: Enterprise workspaces get a fixed subtask ceiling; other plans follow remote config.
// Why: The enterprise ceiling is written into customer contracts, so a config rollout must not lower it.
// Rule: Never read the enterprise ceiling from remote config.
export function getSubtaskLimit(plan: WorkspacePlan): number {
  if (plan === "enterprise") return 500
  return loadBakedConfig("taskLimits").maxSubtasks
}
