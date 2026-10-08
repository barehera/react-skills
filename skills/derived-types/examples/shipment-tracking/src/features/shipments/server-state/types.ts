import type * as z from "zod"

import type { shipmentSchema } from "./schemas"

export type Shipment = z.infer<typeof shipmentSchema>

export type ShipmentListInput = {
  signal?: AbortSignal
}
