import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

import { useTasksQuery } from "../server-state/queries/use-tasks-query"
import type { TaskStatus } from "../types"

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

type TaskListProps = {
  projectId: string
  onOpenTask: (taskId: string) => void
}

export function TaskList({ projectId, onOpenTask }: TaskListProps) {
  const tasksQuery = useTasksQuery(projectId)

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
      {tasksQuery.data.map((task) => (
        <li key={task.id} className="flex items-center gap-3 px-4 py-2">
          <button
            type="button"
            className="flex-1 truncate text-left text-sm hover:underline"
            onClick={() => onOpenTask(task.id)}
          >
            {task.title}
          </button>
          <Badge variant="secondary">{statusLabel[task.status]}</Badge>
        </li>
      ))}
    </ul>
  )
}
