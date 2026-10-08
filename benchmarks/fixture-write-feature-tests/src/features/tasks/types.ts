export type TaskStatus = "todo" | "in_progress" | "blocked" | "done" | "archived"

export type Task = {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  assigneeId: string | null
  createdById: string
  /** ISO date (YYYY-MM-DD) or null when the task has no due date. */
  dueDate: string | null
  /** ISO date (YYYY-MM-DD) the task was archived, or null. */
  archivedAt: string | null
}

export type ViewerRole = "owner" | "editor" | "viewer"

export type Viewer = {
  id: string
  role: ViewerRole
}
