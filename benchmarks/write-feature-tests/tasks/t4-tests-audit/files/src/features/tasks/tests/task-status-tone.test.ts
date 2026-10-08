import { testRule } from "@/tests/rule-cases"

import { TASK_STATUS_TONE } from "../status"
import type { TaskStatus } from "../types"

function taskStatusTone(status: TaskStatus) {
  return TASK_STATUS_TONE[status]
}

testRule(taskStatusTone, [
  { case: "new work stays neutral", input: "todo", expected: "neutral" },
  { case: "work in progress reads as informational", input: "in_progress", expected: "info" },
  { case: "blocked work asks for attention", input: "blocked", expected: "warning" },
  { case: "finished work reads as done", input: "done", expected: "success" },
  { case: "archived work fades out of triage", input: "archived", expected: "muted" },
])
