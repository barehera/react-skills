import { zodResolver } from "@hookform/resolvers/zod"

import { useUpdateTaskMutation } from "../server-state/mutations/use-update-task-mutation"
import { getTaskFormDefaults, TaskFormRoot, taskSchema } from "../task-form"
import type { Task } from "../types"
import { TaskDetailsFields } from "./task-details-fields"
import { TaskFormActions } from "./task-form-actions"

type EditTaskScreenProps = {
  task: Task
  onSaved: (task: Task) => void
}

export function EditTaskScreen({ task, onSaved }: EditTaskScreenProps) {
  const updateTask = useUpdateTaskMutation()

  return (
    <TaskFormRoot
      className="flex flex-col gap-8"
      resolver={zodResolver(taskSchema)}
      defaultValues={getTaskFormDefaults(task)}
      mode="onBlur"
      onSubmit={async (values) => {
        const saved = await updateTask.mutateAsync({
          taskId: task.id,
          ...values,
        })
        onSaved(saved)
      }}
    >
      <TaskDetailsFields />
      <TaskFormActions />
    </TaskFormRoot>
  )
}
