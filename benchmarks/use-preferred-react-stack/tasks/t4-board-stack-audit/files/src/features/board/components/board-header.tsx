import { Button } from "@/components/ui/button"
import { canEditTask } from "@/features/tasks/policy"
import { useViewer } from "@/hooks/use-viewer"

import { useBoardStore } from "../model/board-store"

export function BoardHeader({ title }: { title: string }) {
  const viewer = useViewer()
  const taskCount = useBoardStore((state) => state.tasks.length)
  const isRefreshing = useBoardStore((state) => state.isRefreshing)

  return (
    <header className="flex items-center gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <span className="text-sm text-muted-foreground">
        {taskCount} tasks{isRefreshing && " · refreshing…"}
      </span>
      {canEditTask(viewer) && (
        <Button size="sm" className="ml-auto">
          New task
        </Button>
      )}
    </header>
  )
}
