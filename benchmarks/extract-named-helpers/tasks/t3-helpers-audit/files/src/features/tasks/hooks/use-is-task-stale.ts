import { isTaskStale } from "@/lib/helpers"

import type { Task } from "../types"

export function useIsTaskStale(task: Task) {
  return isTaskStale(task, new Date())
}
