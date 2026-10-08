import type { TaskStatus } from "./types"

export type StatusTone = "neutral" | "info" | "warning" | "success" | "muted"

// Business Logic: Blocked tasks read as a warning and archived tasks are muted.
// Why: Blocked work needs someone to unblock it, and archived work should fade out of the triage view.
// Rule: Never show a blocked task in the neutral tone.
export const TASK_STATUS_TONE = {
  todo: "neutral",
  in_progress: "info",
  blocked: "warning",
  done: "success",
  archived: "muted",
} as const satisfies Record<TaskStatus, StatusTone>

/** URL `?status=` value for each status. */
export const TASK_STATUS_QUERY_PARAM = {
  todo: "todo",
  in_progress: "in_progress",
  blocked: "blocked",
  done: "done",
  archived: "archived",
} as const satisfies Record<TaskStatus, string>
