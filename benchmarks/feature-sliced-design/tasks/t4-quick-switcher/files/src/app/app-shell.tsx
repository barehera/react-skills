import * as React from "react"

import { Button } from "@/components/ui/button"
import { TaskDetailHeader } from "@/features/tasks/components/task-detail-header"
import { TaskList } from "@/features/tasks/components/task-list"

export function AppShell({ projectId }: { projectId: string }) {
  const [openTaskId, setOpenTaskId] = React.useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-4 border-b px-6 py-3">
        <span className="font-semibold">Acme Tasks</span>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-6">
        {openTaskId != null && (
          <section className="flex flex-col gap-2">
            <TaskDetailHeader taskId={openTaskId} />
            <Button
              variant="ghost"
              className="self-start"
              onClick={() => setOpenTaskId(null)}
            >
              Back to all tasks
            </Button>
          </section>
        )}
        <TaskList projectId={projectId} onOpenTask={setOpenTaskId} />
      </main>
    </div>
  )
}
