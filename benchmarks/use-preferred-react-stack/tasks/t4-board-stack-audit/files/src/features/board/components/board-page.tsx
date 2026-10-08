import type { TaskStatus } from "@/features/tasks/types"

import { useBoardUrlSync } from "../hooks/use-board-url-sync"
import { BoardColumn } from "./board-column"
import { BoardFilters } from "./board-filters"
import { BoardHeader } from "./board-header"

const columns: { status: TaskStatus; title: string }[] = [
  { status: "todo", title: "To do" },
  { status: "in_progress", title: "In progress" },
  { status: "done", title: "Done" },
]

export function BoardPage({
  projectId,
  projectName,
}: {
  projectId: string
  projectName: string
}) {
  useBoardUrlSync()

  return (
    <main className="flex flex-col gap-4 p-6">
      <BoardHeader title={projectName} />
      <BoardFilters />
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <BoardColumn key={column.status} projectId={projectId} {...column} />
        ))}
      </div>
    </main>
  )
}
