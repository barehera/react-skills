import type { ActivityEntry } from "@/components/activity-timeline"

import { ProjectActivity } from "./project-activity"
import { TaskActivity } from "./task-activity"

type TaskActivityPageProps = {
  taskEntries: ActivityEntry[]
  projectEntries: ActivityEntry[]
}

export function TaskActivityPage({
  taskEntries,
  projectEntries,
}: TaskActivityPageProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TaskActivity entries={taskEntries} />
      <ProjectActivity entries={projectEntries} />
    </div>
  )
}
