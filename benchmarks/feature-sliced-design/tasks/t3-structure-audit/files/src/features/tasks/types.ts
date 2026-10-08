export type TaskStatus = "todo" | "in_progress" | "done"

export type Task = {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  assigneeId: string | null
  createdById: string
  createdAt: string
}

export type ViewerRole = "owner" | "editor" | "viewer"

export type Viewer = {
  id: string
  role: ViewerRole
}
