import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StatusBadge } from "@/components/ui/status-badge"
import { useTaskStore } from "@/store/task-store"

import { useTasksQuery } from "../server-state/queries/use-tasks-query"

export function TaskList({ projectId }: { projectId: string }) {
  const tasksQuery = useTasksQuery(projectId)
  const tasks = useTaskStore((state) => state.tasks)
  const setTasks = useTaskStore((state) => state.setTasks)
  const selectTask = useTaskStore((state) => state.selectTask)

  React.useEffect(() => {
    if (tasksQuery.data) setTasks(tasksQuery.data)
  }, [tasksQuery.data, setTasks])

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

  return (
    <ul className="divide-y rounded-lg border">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-3 px-4 py-2">
          <button
            type="button"
            className="flex-1 truncate text-left text-sm"
            onClick={() => selectTask(task.id)}
          >
            {task.title}
          </button>
          <StatusBadge status={task.status} />
        </li>
      ))}
    </ul>
  )
}
