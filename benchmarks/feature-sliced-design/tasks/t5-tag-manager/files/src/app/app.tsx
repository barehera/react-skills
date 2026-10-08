import type { Viewer } from "@/features/tasks/types"
import { TaskDetailHeader } from "@/features/tasks/components/task-detail-header"
import { TaskList } from "@/features/tasks/components/task-list"

import { Providers } from "./providers"

type AppProps = {
  viewer: Viewer
  projectId: string
  taskId: string | null
}

export function App({ viewer, projectId, taskId }: AppProps) {
  return (
    <Providers viewer={viewer}>
      <main className="flex flex-col gap-6 p-6">
        {taskId != null && <TaskDetailHeader taskId={taskId} />}
        <TaskList projectId={projectId} />
      </main>
    </Providers>
  )
}
