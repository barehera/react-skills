import { TaskList } from "./task-list"

export function ProjectTasksPage({ projectId }: { projectId: string }) {
  // Filter controls (status, assignee, search box) are being built in TASK-88
  // and will own the filter state on this page.
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Tasks</h2>
      <TaskList projectId={projectId} />
    </section>
  )
}
