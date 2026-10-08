import { checkDecision } from "@/test-support/decision-table"

import { canDeleteTask } from "../policy"

checkDecision(canDeleteTask, [
  { case: "an owner deletes any task", input: { role: "owner", isCreator: false }, expected: true },
  { case: "an editor deletes a task they created", input: { role: "editor", isCreator: true }, expected: true },
  { case: "an editor cannot delete someone else's task", input: { role: "editor", isCreator: false }, expected: false },
  { case: "a viewer cannot delete even a task they created", input: { role: "viewer", isCreator: true }, expected: false },
])
