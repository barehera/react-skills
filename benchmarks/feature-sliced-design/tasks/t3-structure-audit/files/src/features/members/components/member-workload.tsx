import { Badge } from "@/components/ui/badge"
import { useTasksQuery } from "@/features/tasks/server-state/queries/use-tasks-query"
import { formatRelativeDate } from "@/lib/date/format-relative-date"

import { roleLabel } from "../role-label"
import { useMembersQuery } from "../server-state/use-members-query"

export function MemberWorkload({ projectId }: { projectId: string }) {
  const membersQuery = useMembersQuery(projectId, "")
  const tasksQuery = useTasksQuery(projectId)

  if (!membersQuery.data || !tasksQuery.data) return null

  const tasks = tasksQuery.data

  return (
    <ul className="divide-y rounded-lg border">
      {membersQuery.data.map((member) => {
        const openTasks = tasks.filter(
          (task) => task.assigneeId === member.id && task.status !== "done"
        ).length

        return (
          <li key={member.id} className="flex items-center gap-3 px-4 py-2 text-sm">
            <span className="flex-1 truncate">{member.name}</span>
            <Badge variant="outline">{roleLabel[member.role]}</Badge>
            <span className="text-muted-foreground">{openTasks} open</span>
            <span className="text-xs text-muted-foreground">
              joined {formatRelativeDate(member.joinedAt)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
