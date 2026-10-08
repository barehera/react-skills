import type { TaskStatus } from "@/features/tasks/types"

export const TASK_TITLE_MAX_LENGTH = 80

export const TASK_STATUS_ORDER: TaskStatus[] = ["in_progress", "todo", "done"]

export const TASK_SEARCH_DEBOUNCE_MS = 200

export const MEMBER_SEARCH_DEBOUNCE_MS = 250
