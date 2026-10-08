import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskKeys } from "@/features/tasks/server-state/keys"
import type { Task } from "@/features/tasks/types"
import { api } from "@/lib/api"

import { withRetry } from "../lib/with-retry"
import { useBoardStore } from "../model/board-store"

export function useBoardTasks(projectId: string) {
  const search = useBoardStore((state) => state.search)
  const status = useBoardStore((state) => state.status)
  const setTasks = useBoardStore((state) => state.setTasks)
  const setRefreshing = useBoardStore((state) => state.setRefreshing)

  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebouncedSearch(search), 300)
  }, [search])

  const query = useQuery({
    queryKey: [...taskKeys.list(projectId), { status, search: debouncedSearch }],
    queryFn: () => {
      const params = new URLSearchParams({ search: debouncedSearch })
      if (status !== "all") params.set("status", status)
      return withRetry(
        () => api.get<Task[]>(`/projects/${projectId}/tasks?${params.toString()}`),
        { attempts: 5, delayMs: 1000 }
      )
    },
  })

  useEffect(() => {
    if (query.data) setTasks(query.data)
  }, [query.data, setTasks])

  useEffect(() => {
    setRefreshing(query.isFetching)
  }, [query.isFetching, setRefreshing])

  useEffect(() => {
    if (query.isError) toast.error("Couldn't load tasks")
  }, [query.isError])

  return query
}
