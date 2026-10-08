import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useViewer } from "@/hooks/use-viewer"

import { useTasksQuery } from "../server-state/queries/use-tasks-query"
import type { TaskStatus } from "../types"

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
}

export function TaskList({ projectId }: { projectId: string }) {
  const viewer = useViewer()
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
          <span className="flex-1 truncate text-sm">{task.title}</span>
          <Badge variant="secondary">{statusLabel[task.status]}</Badge>
          {/* TODO: row actions (viewer: {viewer.role}) */}
        </li>
      ))}
    </ul>
  )
}
