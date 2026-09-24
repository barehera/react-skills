import { loadDefaultAppConfig } from "../../config/app-config"

export type SupportPlan = "standard" | "priority"

type SubmissionState = {
  valid: boolean
  saving: boolean
}

// Business Logic: A support request submits only when it is valid and no save is already in flight.
// Why: A second submit during a save opens a duplicate ticket that support agents must merge by hand.
// Rule: Never allow submit while saving, even when the form is valid.
export function canSubmit({ valid, saving }: SubmissionState): boolean {
  return valid && !saving
}

// Business Logic: Priority plans get a fixed attachment ceiling, while standard plans follow remote config.
// Why: The priority ceiling is a contractual promise that a config rollout must not lower.
// Rule: Never read the priority ceiling from remote config.
export function getAttachmentLimitMb(plan: SupportPlan): number {
  if (plan === "priority") return 50
  return loadDefaultAppConfig("supportRequest").maxAttachmentMb
}
