import { useMembersQuery } from "@/features/members/server-state/use-members-query"

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
  const membersQuery = useMembersQuery(task.projectId, "")

  return (
    <select
      aria-label="Assignee"
      className="h-9 rounded-md border px-2 text-sm"
      value={assigneeId ?? ""}
      onChange={(event) => onAssigneeChange(event.target.value || undefined)}
    >
      <option value="">Unassigned</option>
      {membersQuery.data?.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      ))}
    </select>
  )
}
