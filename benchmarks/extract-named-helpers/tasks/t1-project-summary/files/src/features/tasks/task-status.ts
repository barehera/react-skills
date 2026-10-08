import type { Task, TaskStatus } from "./types"

export const taskStatusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

export function isTaskDone(task: Pick<Task, "status">): boolean {
  return task.status === "done"
}
