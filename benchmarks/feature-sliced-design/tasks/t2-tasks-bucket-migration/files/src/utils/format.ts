import { TASK_TITLE_MAX_LENGTH } from "@/constants"

export function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function formatTaskTitle(title: string) {
  const trimmed = title.trim()
  if (trimmed.length <= TASK_TITLE_MAX_LENGTH) return trimmed
  return `${trimmed.slice(0, TASK_TITLE_MAX_LENGTH - 1)}…`
}
