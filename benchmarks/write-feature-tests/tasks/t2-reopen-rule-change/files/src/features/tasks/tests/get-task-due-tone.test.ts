import { checkDecision } from "@/test-support/decision-table"

import { dueTone } from "../due"

checkDecision(dueTone, [
  {
    case: "an open task past its due date is overdue",
    input: { dueDate: "2026-03-09", today: "2026-03-10", status: "todo" },
    expected: "overdue",
  },
  {
    case: "an open task due today is due soon",
    input: { dueDate: "2026-03-10", today: "2026-03-10", status: "in_progress" },
    expected: "due-soon",
  },
  {
    case: "an open task due in two days is due soon",
    input: { dueDate: "2026-03-12", today: "2026-03-10", status: "blocked" },
    expected: "due-soon",
  },
  {
    case: "an open task due in three days needs no badge yet",
    input: { dueDate: "2026-03-13", today: "2026-03-10", status: "todo" },
    expected: "none",
  },
  {
    case: "a done task is never overdue",
    input: { dueDate: "2026-03-01", today: "2026-03-10", status: "done" },
    expected: "none",
  },
  {
    case: "a task without a due date needs no badge",
    input: { dueDate: null, today: "2026-03-10", status: "todo" },
    expected: "none",
  },
])
