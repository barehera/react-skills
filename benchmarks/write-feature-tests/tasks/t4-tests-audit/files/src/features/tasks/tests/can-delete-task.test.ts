// Business Logic: Owners may delete any task; editors may delete only tasks they created.
// Why: Deleted tasks cannot be restored and break history links for other members.
// Rule: Never let a viewer delete a task, even one they created.
import { testRule } from "@/tests/rule-cases"

import { canDeleteTask } from "../policy"

testRule(canDeleteTask, [
  { case: "an owner deletes any task", input: { role: "owner", isCreator: false }, expected: true },
  { case: "an editor deletes a task they created", input: { role: "editor", isCreator: true }, expected: true },
  { case: "an editor cannot delete someone else's task", input: { role: "editor", isCreator: false }, expected: false },
  { case: "a viewer cannot delete even a task they created", input: { role: "viewer", isCreator: true }, expected: false },
])
