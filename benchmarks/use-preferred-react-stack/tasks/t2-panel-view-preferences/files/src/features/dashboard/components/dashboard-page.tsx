import { TaskPanel } from "@/features/tasks/components/task-panel"

export function DashboardPage() {
  return (
    <main className="grid gap-6 p-6 lg:grid-cols-2">
      <TaskPanel projectId="website" title="Website" />
      <TaskPanel projectId="mobile-app" title="Mobile app" />
    </main>
  )
}
