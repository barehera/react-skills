import { TaskList } from "./task-list"

export function TasksPage({ projectId }: { projectId: string }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <TaskList projectId={projectId} />
    </main>
  )
}
