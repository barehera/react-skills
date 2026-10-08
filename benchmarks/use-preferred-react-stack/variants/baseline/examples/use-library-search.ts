"use client"

import { useDebouncedValue } from "@tanstack/react-pacer/debouncer"
import { parseAsString, useQueryState } from "nuqs"
import { toast } from "sonner"
import { usePreferences } from "./preferences-provider"

export function useLibrarySearch() {
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""))
  const [settledSearch] = useDebouncedValue(search, { wait: 400 })
  const sortOrder = usePreferences(state => state.sortOrder)
  const setSortOrder = usePreferences(state => state.setSortOrder)

  return {
    search,
    setSearch,
    settledSearch,
    isDebouncing: search !== settledSearch,
    sortOrder,
    setSortOrder,
  }
}

export function notifyLibrarySearchFailure(message: string) {
  toast.error(message, { id: "library-search-failure" })
}
