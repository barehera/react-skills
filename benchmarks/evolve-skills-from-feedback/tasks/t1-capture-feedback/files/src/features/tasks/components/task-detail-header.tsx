import { useTaskQuery } from "../server-state/queries/use-tasks-query"
import { TaskActions } from "./task-actions"

export function TaskDetailHeader({ taskId }: { taskId: string }) {
  const taskQuery = useTaskQuery(taskId)

  if (!taskQuery.data) return null

  return (
    <header className="flex items-center gap-4 border-b pb-4">
      <h1 className="flex-1 text-2xl font-semibold">{taskQuery.data.title}</h1>
      <TaskActions task={taskQuery.data} size="lg" />
    </header>
  )
}
