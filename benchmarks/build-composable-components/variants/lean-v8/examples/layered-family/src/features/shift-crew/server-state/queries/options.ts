import { queryOptions } from "@tanstack/react-query"

import { shiftCrewApi } from "../api"
import type { ShiftCrewDetailInput } from "../types"
import { shiftCrewKeys } from "./keys"

export function shiftCrewDetailOptions({
  shiftId,
}: Omit<ShiftCrewDetailInput, "signal">) {
  return queryOptions({
    queryKey: shiftCrewKeys.detail(shiftId),
    queryFn: ({ signal }) => shiftCrewApi.detail({ shiftId, signal }),
  })
}
