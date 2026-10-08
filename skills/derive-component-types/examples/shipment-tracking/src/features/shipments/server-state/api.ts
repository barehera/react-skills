import { api } from "../../../server-state/api"
import { parseApiPayload } from "../../../server-state/utils"

import { shipmentListSchema } from "./schemas"
import type { ShipmentListInput } from "./types"

const shipmentRoutes = {
  list: "/shipments",
} as const

export const shipmentApi = {
  async list({ signal }: ShipmentListInput = {}) {
    const response = await api.get<unknown>(shipmentRoutes.list, { signal })

    return parseApiPayload(shipmentListSchema, response.data)
  },
} as const
