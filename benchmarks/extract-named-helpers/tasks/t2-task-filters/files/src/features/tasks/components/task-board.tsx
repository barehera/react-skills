import { useMembersQuery } from "@/features/members/server-state/use-members-query"

import { useTaskFilters } from "../hooks/use-task-filters"
import { useTasksQuery } from "../server-state/queries/use-tasks-query"
import { TaskFilterBar } from "./task-filter-bar"

export function TaskBoard({ projectId }: { projectId: string }) {
  const tasksQuery = useTasksQuery(projectId)
  const membersQuery = useMembersQuery(projectId, "")
  const taskFilters = useTaskFilters(
    tasksQuery.data ?? [],
    `task-filters:${projectId}`
  )

  return (
    <section className="grid gap-4">
      <TaskFilterBar
        filters={taskFilters.filters}
        members={membersQuery.data ?? []}
        onToggleStatus={taskFilters.toggleStatus}
        onAssigneeChange={taskFilters.setAssigneeId}
        onQueryChange={taskFilters.setQuery}
      />
      {taskFilters.hasActiveFilters && taskFilters.visibleTasks.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No tasks match these filters.
        </p>
      )}
      <ul className="divide-y rounded-lg border">
        {taskFilters.visibleTasks.map((task) => (
          <li key={task.id} className="px-4 py-2 text-sm">
            {task.title}
          </li>
        ))}
      </ul>
    </section>
  )
}
