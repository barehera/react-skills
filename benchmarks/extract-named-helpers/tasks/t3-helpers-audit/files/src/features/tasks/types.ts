export type TaskStatus = "todo" | "in_progress" | "done"

export type Task = {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  assigneeId: string | null
  createdById: string
  /** Calendar day, "YYYY-MM-DD". */
  dueDate: string | null
  /** ISO timestamp of the last change. */
  updatedAt: string
}

export type ViewerRole = "owner" | "editor" | "viewer"

export type Viewer = {
  id: string
  role: ViewerRole
}
