import { isEmpty } from "@/lib/helpers"

import { useTasksQuery } from "../server-state/queries/use-tasks-query"
import { isProjectComplete } from "../task-utils"

export function ProjectHeader({
  projectId,
  name,
}: {
  projectId: string
  name: string
}) {
  const tasksQuery = useTasksQuery(projectId)
  const tasks = tasksQuery.data ?? []

  return (
    <header className="grid gap-1 border-b pb-4">
      <h1 className="text-2xl font-semibold">{name}</h1>
      {isEmpty(tasks) && (
        <p className="text-sm text-muted-foreground">No tasks yet.</p>
      )}
      {tasksQuery.isSuccess && isProjectComplete(tasks) && (
        <p className="text-sm text-emerald-700">All tasks done 🎉</p>
      )}
    </header>
  )
}
