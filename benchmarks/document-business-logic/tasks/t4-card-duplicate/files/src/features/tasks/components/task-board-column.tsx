import type { Task } from "../types"
import { TaskCard } from "./task-card"

export function TaskBoardColumn({ title, tasks }: { title: string; tasks: Task[] }) {
  return (
    <section className="flex flex-col gap-3">
      {/* column heading */}
      <h2 className="text-sm font-semibold">{title}</h2>
      {/* loop over the tasks and render a card for each one */}
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </section>
  )
}
