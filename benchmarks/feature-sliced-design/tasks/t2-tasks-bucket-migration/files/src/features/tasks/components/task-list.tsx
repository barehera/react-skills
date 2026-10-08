import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useTaskFilters } from "@/hooks/use-task-filters"
import { filterTasks, formatCount, formatTaskTitle, sortTasksByStatus } from "@/utils"

import { useTasksQuery } from "../server-state/queries/use-tasks-query"
import type { TaskStatus } from "../types"
import { TaskFilterBar } from "./task-filter-bar"

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

export function TaskList({ projectId }: { projectId: string }) {
  const tasksQuery = useTasksQuery(projectId)
  const status = useTaskFilters((state) => state.status)
  const search = useTaskFilters((state) => state.search)

  if (tasksQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading tasks…</p>
  }

  if (tasksQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Tasks unavailable</AlertTitle>
        <AlertDescription>{tasksQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  const visibleTasks = sortTasksByStatus(
    filterTasks(tasksQuery.data, { status, search })
  )

  return (
    <div className="flex flex-col gap-3">
      <TaskFilterBar />
      <p className="text-xs text-muted-foreground">
        {formatCount(visibleTasks.length, "task", "tasks")}
      </p>
      <ul className="divide-y rounded-lg border">
        {visibleTasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3 px-4 py-2">
            <span className="flex-1 truncate text-sm">
              {formatTaskTitle(task.title)}
            </span>
            <Badge variant="secondary">{statusLabel[task.status]}</Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}
