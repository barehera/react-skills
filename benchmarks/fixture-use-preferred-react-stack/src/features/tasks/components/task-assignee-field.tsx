import type { Task } from "../types"

type TaskAssigneeFieldProps = {
  task: Task
  assigneeId: string | undefined
  onAssigneeChange: (assigneeId: string | undefined) => void
}

export function TaskAssigneeField({
  task,
  assigneeId,
  onAssigneeChange,
}: TaskAssigneeFieldProps) {
  // TODO: replace with the assignee picker
  return (
    <div className="text-sm text-muted-foreground">
      {assigneeId ?? "Unassigned"} ({task.projectId})
      <button type="button" onClick={() => onAssigneeChange(undefined)}>
        Clear
      </button>
    </div>
  )
}
