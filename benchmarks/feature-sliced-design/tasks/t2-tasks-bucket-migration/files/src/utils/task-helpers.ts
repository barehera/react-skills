import { TASK_STATUS_ORDER } from "@/constants"
import type { Task } from "@/features/tasks/types"
import type { TaskFilterState } from "@/types/task-filter"

export function filterTasks(tasks: Task[], filter: TaskFilterState) {
  const search = filter.search.trim().toLowerCase()

  return tasks.filter(
    (task) =>
      (filter.status === "all" || task.status === filter.status) &&
      (search === "" || task.title.toLowerCase().includes(search))
  )
}

export function sortTasksByStatus(tasks: Task[]) {
  return [...tasks].sort(
    (a, b) => TASK_STATUS_ORDER.indexOf(a.status) - TASK_STATUS_ORDER.indexOf(b.status)
  )
}
