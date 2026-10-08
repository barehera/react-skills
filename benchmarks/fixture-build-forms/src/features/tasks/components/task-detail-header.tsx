import { useViewer } from "@/hooks/use-viewer"

import { useTaskQuery } from "../server-state/queries/use-tasks-query"

export function TaskDetailHeader({ taskId }: { taskId: string }) {
  const viewer = useViewer()
  const taskQuery = useTaskQuery(taskId)

  if (!taskQuery.data) return null

  return (
    <header className="flex items-center gap-4 border-b pb-4">
      <h1 className="flex-1 text-2xl font-semibold">{taskQuery.data.title}</h1>
      {/* Actions will go here (viewer: {viewer.role}) */}
    </header>
  )
}
