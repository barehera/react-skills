import { canReopenTask } from "../policy"
import type { Task, Viewer } from "../types"
import { makeTask, makeViewer, runTaskTable } from "./helpers/task-table"

// Adapts canReopenTask to the task-table runner.
function reopenWith(task: Task, viewer: Viewer) {
  return canReopenTask({ status: task.status, role: viewer.role, isAssignee: task.assigneeId === viewer.id })
}

runTaskTable("canReopenTask", reopenWith, [
  {
    name: "the assignee reopens their done task",
    task: makeTask({ status: "done", assigneeId: "user-1" }),
    viewer: makeViewer({ id: "user-1", role: "editor" }),
    expected: true,
  },
  {
    name: "an owner reopens any done task",
    task: makeTask({ status: "done" }),
    viewer: makeViewer({ role: "owner" }),
    expected: true,
  },
  {
    name: "a viewer cannot reopen even a done task assigned to them",
    task: makeTask({ status: "done", assigneeId: "user-1" }),
    viewer: makeViewer({ id: "user-1", role: "viewer" }),
    expected: false,
  },
  {
    name: "an archived task never reopens, even for an owner",
    task: makeTask({ status: "archived", archivedAt: "2026-02-01" }),
    viewer: makeViewer({ role: "owner" }),
    expected: false,
  },
])
