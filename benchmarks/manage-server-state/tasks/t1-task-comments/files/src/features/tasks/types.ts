export type TaskStatus = "todo" | "in_progress" | "done"

export type Task = {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  assigneeId: string | null
  createdById: string
  commentCount: number
}

export type ViewerRole = "owner" | "editor" | "viewer"

export type Viewer = {
  id: string
  role: ViewerRole
}
