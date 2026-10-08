import type { Task, TaskStatus, Viewer } from "./types"

export function isTaskDone(task: Pick<Task, "status">) {
  return task.status === "done"
}

export const isCompleted = isTaskDone

const statusOrder: Record<TaskStatus, number> = {
  in_progress: 0,
  todo: 1,
  done: 2,
}

export function getStatusRank(status: TaskStatus) {
  return statusOrder[status]
}

export function getSortedTasks(tasks: Task[]) {
  return tasks.sort(
    (a, b) =>
      getStatusRank(a.status) - getStatusRank(b.status) ||
      a.title.localeCompare(b.title)
  )
}

export function isProjectComplete(tasks: readonly Task[]) {
  return tasks.every(isTaskDone)
}

/**
 * Business Logic: Only owners may reopen a done task.
 * Why: Reopened work silently changes last sprint's velocity report, so the
 * owner who signs off the report must make that call.
 */
export function canReopenTask(task: Pick<Task, "status">, viewer: Viewer) {
  return isTaskDone(task) && viewer.role === "owner"
}

export function toDueDayLabel(dueDate: string | null) {
  return dueDate ?? "No due date"
}

export function getTaskTitle(task: Pick<Task, "title">) {
  return task.title.trim() || "Untitled task"
}
