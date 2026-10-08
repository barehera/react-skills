export type TaskStatus = "todo" | "in_progress" | "done"

export type Task = {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  assigneeId: string | null
  createdById: string
  /** Calendar day in the project's time zone, "YYYY-MM-DD". */
  dueDate: string | null
}

export type ViewerRole = "owner" | "editor" | "viewer"

export type Viewer = {
  id: string
  role: ViewerRole
}
