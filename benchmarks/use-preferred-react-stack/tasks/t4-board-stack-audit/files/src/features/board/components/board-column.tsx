import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TaskStatus } from "@/features/tasks/types"

import { useBoardTasks } from "../hooks/use-board-tasks"
import { useCollapsedColumnsStore } from "../model/collapsed-columns-store"

export function BoardColumn({
  projectId,
  status,
  title,
}: {
  projectId: string
  status: TaskStatus
  title: string
}) {
  const tasksQuery = useBoardTasks(projectId)
  const isCollapsed = useCollapsedColumnsStore((state) =>
    state.collapsed.includes(status)
  )
  const toggle = useCollapsedColumnsStore((state) => state.toggle)
  const tasks = tasksQuery.data?.filter((task) => task.status === status) ?? []

  return (
    <section className="flex flex-col gap-2 rounded-lg border p-3">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{title}</h2>
        <Badge variant="secondary">{tasks.length}</Badge>
        <Button variant="ghost" size="sm" onClick={() => toggle(status)}>
          {isCollapsed ? "Expand" : "Collapse"}
        </Button>
      </header>
      {!isCollapsed && (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li key={task.id} className="rounded-md border px-3 py-2 text-sm">
              {task.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
