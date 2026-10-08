import * as React from "react"

import type { Task, TaskStatus } from "../types"

export type TaskFilters = {
  statuses: TaskStatus[]
  /** `undefined` = any assignee, `null` = unassigned tasks only. */
  assigneeId: string | null | undefined
  query: string
}

const defaultFilters: TaskFilters = {
  statuses: [],
  assigneeId: undefined,
  query: "",
}

export function useTaskFilters(tasks: Task[], storageKey: string) {
  const [filters, setFilters] = React.useState<TaskFilters>(() => {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaultFilters
    try {
      const parsed = JSON.parse(raw) as Partial<TaskFilters>
      return {
        statuses: Array.isArray(parsed.statuses)
          ? parsed.statuses.filter(
              (status): status is TaskStatus =>
                status === "todo" ||
                status === "in_progress" ||
                status === "done"
            )
          : [],
        assigneeId:
          parsed.assigneeId === null
            ? null
            : typeof parsed.assigneeId === "string"
              ? parsed.assigneeId
              : undefined,
        query: typeof parsed.query === "string" ? parsed.query : "",
      }
    } catch {
      return defaultFilters
    }
  })

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(filters))
  }, [storageKey, filters])

  const toggleStatus = (status: TaskStatus) => {
    setFilters((previous) => {
      if (previous.statuses.includes(status)) {
        return {
          ...previous,
          statuses: previous.statuses.filter((item) => item !== status),
        }
      }
      const statuses = [...previous.statuses, status]
      // Every status selected means the same as no status filter.
      if (statuses.length === 3) return { ...previous, statuses: [] }
      return { ...previous, statuses }
    })
  }

  const setAssigneeId = (assigneeId: string | null | undefined) => {
    setFilters((previous) => ({ ...previous, assigneeId }))
  }

  const setQuery = (query: string) => {
    setFilters((previous) => ({ ...previous, query }))
  }

  const search = filters.query.trim().toLowerCase()
  const visibleTasks = tasks.filter(
    (task) =>
      (filters.statuses.length === 0 ||
        filters.statuses.includes(task.status)) &&
      (filters.assigneeId === undefined ||
        task.assigneeId === filters.assigneeId) &&
      (search === "" || task.title.toLowerCase().includes(search))
  )

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.assigneeId !== undefined ||
    search !== ""

  return {
    filters,
    visibleTasks,
    hasActiveFilters,
    toggleStatus,
    setAssigneeId,
    setQuery,
  }
}
