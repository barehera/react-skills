import * as z from "zod"

import { createForm } from "@/features/form/components/form"

import type { Task, TaskStatus } from "./types"

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters.")
    .max(120, "Keep the title under 120 characters."),
  status: z.enum(["todo", "in_progress", "done"]),
})

export type TaskForm = z.infer<typeof taskSchema>

export const TASK_STATUSES = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
] as const satisfies ReadonlyArray<{ value: TaskStatus; label: string }>

export function getTaskFormDefaults(task: Task): TaskForm {
  return {
    title: task.title,
    status: task.status,
  }
}

export const { Form: TaskFormRoot, useForm: useTaskForm } =
  createForm<TaskForm>()
