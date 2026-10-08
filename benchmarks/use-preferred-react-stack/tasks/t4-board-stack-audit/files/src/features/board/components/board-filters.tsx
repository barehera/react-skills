import { useCallback, useMemo, type ChangeEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useFlash } from "../hooks/use-flash"
import { useBoardStore, type BoardStatusFilter } from "../model/board-store"

export function BoardFilters() {
  const search = useBoardStore((state) => state.search)
  const status = useBoardStore((state) => state.status)
  const setSearch = useBoardStore((state) => state.setSearch)
  const setStatus = useBoardStore((state) => state.setStatus)
  const [copied, flashCopied] = useFlash()

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All" },
      { value: "todo", label: "To do" },
      { value: "in_progress", label: "In progress" },
      { value: "done", label: "Done" },
    ],
    []
  )

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value),
    [setSearch]
  )

  const copyLink = useCallback(() => {
    void navigator.clipboard.writeText(window.location.href)
    flashCopied()
  }, [flashCopied])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        aria-label="Search tasks"
        placeholder="Search tasks"
        value={search}
        onChange={handleSearchChange}
        className="max-w-xs"
      />
      <Tabs
        value={status}
        onValueChange={(value) => setStatus(value as BoardStatusFilter)}
      >
        <TabsList>
          {statusOptions.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  )
}
