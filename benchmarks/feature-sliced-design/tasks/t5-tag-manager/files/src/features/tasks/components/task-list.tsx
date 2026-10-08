import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useViewer } from "@/hooks/use-viewer"

import { canDeleteTask, canEditTask } from "../policy"
import { useDeleteTaskMutation } from "../server-state/mutations/use-delete-task-mutation"
import { useRenameTaskMutation } from "../server-state/mutations/use-rename-task-mutation"
import { useTasksQuery } from "../server-state/queries/use-tasks-query"
import type { Task, TaskStatus } from "../types"

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

export function TaskList({ projectId }: { projectId: string }) {
  const viewer = useViewer()
  const tasksQuery = useTasksQuery(projectId)
  const renameTask = useRenameTaskMutation()
  const deleteTask = useDeleteTaskMutation()

  function rename(task: Task) {
    const title = window.prompt("Rename task", task.title)?.trim()
    if (title) renameTask.mutate({ task, title })
  }

  function remove(task: Task) {
    if (window.confirm(`Delete "${task.title}"?`)) deleteTask.mutate(task)
  }

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
          <span className="flex-1 truncate text-sm">{task.title}</span>
          <Badge variant="secondary">{statusLabel[task.status]}</Badge>
          {canEditTask(viewer) && (
            <Button size="sm" variant="ghost" onClick={() => rename(task)}>
              Rename
            </Button>
          )}
          {canDeleteTask(task, viewer) && (
            <Button size="sm" variant="ghost" onClick={() => remove(task)}>
              Delete
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
