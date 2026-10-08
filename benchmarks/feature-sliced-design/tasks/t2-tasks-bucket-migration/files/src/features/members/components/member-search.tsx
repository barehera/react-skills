import * as React from "react"

import { MEMBER_SEARCH_DEBOUNCE_MS } from "@/constants"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatCount } from "@/utils"

import { useMembersQuery } from "../server-state/use-members-query"

export function MemberSearch({ projectId }: { projectId: string }) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, MEMBER_SEARCH_DEBOUNCE_MS)
  const membersQuery = useMembersQuery(projectId, debouncedSearch)

  return (
    <div className="flex flex-col gap-2">
      <input
        aria-label="Search members"
        className="h-9 rounded-md border px-3 text-sm"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {membersQuery.isSuccess && (
        <>
          <p className="text-xs text-muted-foreground">
            {formatCount(membersQuery.data.length, "member", "members")}
          </p>
          <ul className="divide-y rounded-lg border">
            {membersQuery.data.map((member) => (
              <li key={member.id} className="px-4 py-2 text-sm">
                {member.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
