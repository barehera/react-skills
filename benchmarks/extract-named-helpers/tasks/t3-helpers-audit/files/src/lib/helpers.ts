import type { Task } from "@/features/tasks/types"

/** The API sorts by `<field>` ascending or `-<field>` descending. */
export function toApiSortParam(field: string, direction: "asc" | "desc") {
  return direction === "desc" ? `-${field}` : field
}

export function isEmpty<T>(items: readonly T[]) {
  return items.length === 0
}

const STALE_AFTER_DAYS = 14

/**
 * Open tasks untouched for two weeks are flagged so leads can chase them.
 */
export function isTaskStale(task: Task, now: Date) {
  if (task.status === "done") return false
  const ageInDays =
    (now.getTime() - new Date(task.updatedAt).getTime()) / 86_400_000
  return ageInDays >= STALE_AFTER_DAYS
}
