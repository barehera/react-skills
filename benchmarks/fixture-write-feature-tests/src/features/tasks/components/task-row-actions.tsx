import { useViewer } from "@/hooks/use-viewer"

import { getTaskDueTone } from "../due"
import { canDeleteTask, canReopenTask } from "../policy"
import type { Task } from "../types"

type TaskRowActionsProps = {
  task: Task
  today: string
  onReopen: (taskId: string) => void
  onDelete: (taskId: string) => void
}

export function TaskRowActions({ task, today, onReopen, onDelete }: TaskRowActionsProps) {
  const viewer = useViewer()
  const dueTone = getTaskDueTone({ dueDate: task.dueDate, today, status: task.status })
  const reopenAllowed = canReopenTask({
    status: task.status,
    role: viewer.role,
    isAssignee: task.assigneeId === viewer.id,
  })
  const deleteAllowed = canDeleteTask({ role: viewer.role, isCreator: task.createdById === viewer.id })

  return (
    <div className="flex items-center gap-2" data-due-tone={dueTone}>
      {reopenAllowed && (
        <button type="button" onClick={() => onReopen(task.id)}>
          Reopen
        </button>
      )}
      {deleteAllowed && (
        <button type="button" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      )}
    </div>
  )
}
