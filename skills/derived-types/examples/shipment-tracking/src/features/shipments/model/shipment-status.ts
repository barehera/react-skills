import { shipmentStatusSchema } from "../server-state/schemas"

export const shipmentStatusFilters = ["all", ...shipmentStatusSchema.options] as const

export type ShipmentStatusFilter = (typeof shipmentStatusFilters)[number]

export const shipmentStatusLabels = {
  all: "All",
  pending: "Pending",
  in_transit: "In transit",
  delivered: "Delivered",
} satisfies Record<ShipmentStatusFilter, string>

export function isShipmentStatusFilter(value: string): value is ShipmentStatusFilter {
  return shipmentStatusFilters.some((filter) => filter === value)
}
