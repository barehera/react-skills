import type { TaskStatus, ViewerRole } from "./types"

// Business Logic: Owners may delete any task; editors may delete only tasks they created.
// Why: Deleted tasks cannot be restored and break history links for other members.
// Rule: Never let a viewer delete a task, even one they created.
export function canDeleteTask({ role, isCreator }: { role: ViewerRole; isCreator: boolean }): boolean {
  if (role === "owner") return true
  return role === "editor" && isCreator
}

// Business Logic: A done task can be reopened by its assignee or by any owner. Archived tasks never reopen.
// Why: Archived tasks are already excluded from velocity reports, so reopening one silently corrupts them.
// Rule: Never reopen an archived task, whoever asks.
export function canReopenTask({
  status,
  role,
  isAssignee,
}: {
  status: TaskStatus
  role: ViewerRole
  isAssignee: boolean
}): boolean {
  if (status !== "done") return false
  if (role === "viewer") return false
  return role === "owner" || isAssignee
}
