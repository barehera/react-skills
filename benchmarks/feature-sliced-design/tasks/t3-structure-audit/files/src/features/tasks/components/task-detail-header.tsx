import { Badge } from "@/components/ui/badge"
import { canDeleteTask, statusLabel } from "@/features/tasks"
import { useViewer } from "@/hooks/use-viewer"
import { formatRelativeDate } from "@/lib/date/format-relative-date"

import { useTaskQuery } from "../server-state/queries/use-tasks-query"

export function TaskDetailHeader({ taskId }: { taskId: string }) {
  const viewer = useViewer()
  const taskQuery = useTaskQuery(taskId)

  if (!taskQuery.data) return null

  const task = taskQuery.data

  return (
    <header className="flex items-center gap-4 border-b pb-4">
      <div className="flex flex-1 flex-col gap-1">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <p className="text-xs text-muted-foreground">
          Created {formatRelativeDate(task.createdAt)}
        </p>
      </div>
      <Badge variant="secondary">{statusLabel[task.status]}</Badge>
      {canDeleteTask(task, viewer) && (
        <span className="text-xs text-muted-foreground">
          You can delete this task
        </span>
      )}
    </header>
  )
}
