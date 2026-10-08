import { testRule } from "@/tests/rule-cases"

import { TASK_STATUS_QUERY_PARAM } from "../status"
import type { TaskStatus } from "../types"

function taskStatusQueryParam(status: TaskStatus) {
  return TASK_STATUS_QUERY_PARAM[status]
}

testRule(taskStatusQueryParam, [
  { case: "todo", input: "todo", expected: "todo" },
  { case: "in_progress", input: "in_progress", expected: "in_progress" },
  { case: "blocked", input: "blocked", expected: "blocked" },
  { case: "done", input: "done", expected: "done" },
  { case: "archived", input: "archived", expected: "archived" },
])
