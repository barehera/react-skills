import { checkDecision } from "@/test-support/decision-table"

import { canReopenTask } from "../policy"

checkDecision(canReopenTask, [
  {
    case: "the assignee reopens their done task",
    input: { status: "done", role: "editor", isAssignee: true },
    expected: true,
  },
  {
    case: "an owner reopens any done task",
    input: { status: "done", role: "owner", isAssignee: false },
    expected: true,
  },
  {
    case: "an editor cannot reopen someone else's done task",
    input: { status: "done", role: "editor", isAssignee: false },
    expected: false,
  },
  {
    case: "a viewer cannot reopen even a done task assigned to them",
    input: { status: "done", role: "viewer", isAssignee: true },
    expected: false,
  },
  {
    case: "an archived task never reopens, even for an owner",
    input: { status: "archived", role: "owner", isAssignee: false },
    expected: false,
  },
  {
    case: "an open task has nothing to reopen",
    input: { status: "in_progress", role: "owner", isAssignee: true },
    expected: false,
  },
])
