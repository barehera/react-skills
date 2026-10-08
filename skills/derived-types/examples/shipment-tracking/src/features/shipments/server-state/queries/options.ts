import { queryOptions } from "@tanstack/react-query"

import { shipmentApi } from "../api"
import { shipmentKeys } from "./keys"

export function shipmentListOptions() {
  return queryOptions({
    queryKey: shipmentKeys.list(),
    queryFn: ({ signal }) => shipmentApi.list({ signal }),
  })
}
