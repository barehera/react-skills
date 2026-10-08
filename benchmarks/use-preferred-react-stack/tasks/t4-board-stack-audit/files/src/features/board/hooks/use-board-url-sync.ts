import { useEffect } from "react"

import { useBoardStore, type BoardStatusFilter } from "../model/board-store"

/** Keeps the board filters and the address bar in sync. */
export function useBoardUrlSync() {
  const search = useBoardStore((state) => state.search)
  const status = useBoardStore((state) => state.status)
  const setSearch = useBoardStore((state) => state.setSearch)
  const setStatus = useBoardStore((state) => state.setStatus)

  // URL -> store, on load and on back/forward
  useEffect(() => {
    function readUrl() {
      const params = new URLSearchParams(window.location.search)
      setSearch(params.get("q") ?? "")
      setStatus((params.get("status") as BoardStatusFilter | null) ?? "all")
    }

    readUrl()
    window.addEventListener("popstate", readUrl)
    return () => window.removeEventListener("popstate", readUrl)
  }, [setSearch, setStatus])

  // store -> URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (search !== "") params.set("q", search)
    if (status !== "all") params.set("status", status)
    window.history.pushState(null, "", `?${params.toString()}`)
  }, [search, status])
}
