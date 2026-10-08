import { daysBetween } from "@/lib/dates"

import type { TaskStatus } from "./types"

export type DueTone = "overdue" | "due-soon" | "none"

// Business Logic: An open task past its due date is overdue; one due within the next two days is due soon.
// Why: The list badge drives the morning triage; finished work must not compete with open work for attention.
// Rule: Never flag a done or archived task as overdue or due soon.
export function getTaskDueTone({
  dueDate,
  today,
  status,
}: {
  dueDate: string | null
  today: string
  status: TaskStatus
}): DueTone {
  if (status === "done" || status === "archived") return "none"
  if (dueDate === null) return "none"
  const daysLeft = daysBetween(today, dueDate)
  if (daysLeft < 0) return "overdue"
  if (daysLeft <= 2) return "due-soon"
  return "none"
}
