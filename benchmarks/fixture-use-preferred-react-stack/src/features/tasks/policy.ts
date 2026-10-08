import type { Task, Viewer } from "./types"

/**
 * Business Logic: Only owners, or the editor who created a task, may delete it.
 * Why: Deleted tasks cannot be restored and break history links for others.
 */
export function canDeleteTask(task: Task, viewer: Viewer) {
  if (viewer.role === "owner") return true
  return viewer.role === "editor" && task.createdById === viewer.id
}

export function canEditTask(viewer: Viewer) {
  return viewer.role !== "viewer"
}
