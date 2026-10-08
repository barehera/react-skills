import type { Task, TaskStatus } from "./types"

export const statusOrder: TaskStatus[] = ["todo", "in_progress", "done"]

export function getAllowedNextStatuses(task: Task): TaskStatus[] {
  if (task.status === "done") return ["in_progress"]

  if (task.assigneeId === null) {
    return task.status === "in_progress" ? ["todo"] : []
  }

  return statusOrder.filter((status) => status !== task.status)
}

export function canMoveTask(task: Task, next: TaskStatus) {
  return getAllowedNextStatuses(task).includes(next)
}
