import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useViewer } from "@/hooks/use-viewer"

import { useIsTaskStale } from "../hooks/use-is-task-stale"
import { useTasksQuery } from "../server-state/queries/use-tasks-query"
import {
  canReopenTask,
  getSortedTasks,
  getTaskTitle,
  isCompleted,
  toDueDayLabel,
} from "../task-utils"
import type { Task } from "../types"

function TaskRow({ task, onReopen }: { task: Task; onReopen: () => void }) {
  const viewer = useViewer()
  const isStale = useIsTaskStale(task)

  return (
    <li className="flex items-center gap-3 px-4 py-2">
      <span className="flex-1 truncate text-sm">{getTaskTitle(task)}</span>
      <span className="text-xs text-muted-foreground">
        {toDueDayLabel(task.dueDate)}
      </span>
      {isStale && <Badge variant="outline">Stale</Badge>}
      {isCompleted(task) && <Badge variant="secondary">Done</Badge>}
      {canReopenTask(task, viewer) && (
        <Button size="sm" variant="ghost" onClick={onReopen}>
          Reopen
        </Button>
      )}
    </li>
  )
}

export function TaskList({
  projectId,
  onReopen,
}: {
  projectId: string
  onReopen: (task: Task) => void
}) {
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
      {getSortedTasks(tasksQuery.data).map((task) => (
        <TaskRow key={task.id} task={task} onReopen={() => onReopen(task)} />
      ))}
    </ul>
  )
}
