import { Button } from "@/components/ui/button"
import { useViewer } from "@/hooks/use-viewer"

import { canDeleteTask, canEditTask } from "../policy"
import { useDeleteTaskMutation } from "../server-state/mutations/use-delete-task-mutation"
import { useRenameTaskMutation } from "../server-state/mutations/use-rename-task-mutation"
import { useTaskQuery } from "../server-state/queries/use-tasks-query"

export function TaskDetailHeader({ taskId }: { taskId: string }) {
  const viewer = useViewer()
  const taskQuery = useTaskQuery(taskId)
  const renameTask = useRenameTaskMutation()
  const deleteTask = useDeleteTaskMutation()

  if (!taskQuery.data) return null

  const task = taskQuery.data

  function rename() {
    const title = window.prompt("Rename task", task.title)?.trim()
    if (title) renameTask.mutate({ task, title })
  }

  function remove() {
    if (window.confirm(`Delete "${task.title}"?`)) deleteTask.mutate(task)
  }

  return (
    <header className="flex items-center gap-4 border-b pb-4">
      <h1 className="flex-1 text-2xl font-semibold">{task.title}</h1>
      {canEditTask(viewer) && (
        <Button variant="outline" onClick={rename}>
          Rename
        </Button>
      )}
      {canDeleteTask(task, viewer) && (
        <Button variant="destructive" onClick={remove}>
          Delete
        </Button>
      )}
    </header>
  )
}
