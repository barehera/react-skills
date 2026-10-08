import type { TaskStatus } from "./types"

export const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}
