export type TaskStatus = "todo" | "in_progress" | "done"

export type ChecklistItem = {
  text: string
  done: boolean
}

export type RepeatInterval = "day" | "week" | "month"

export type Task = {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  assigneeId: string | null
  createdById: string
  checklist: ChecklistItem[]
  /** `null` when the task does not repeat. */
  repeatEvery: RepeatInterval | null
}

export type ViewerRole = "owner" | "editor" | "viewer"

export type Viewer = {
  id: string
  role: ViewerRole
}
