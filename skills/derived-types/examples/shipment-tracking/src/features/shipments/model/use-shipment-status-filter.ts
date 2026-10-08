"use client"

import { useState } from "react"

import type { Shipment } from "../server-state/types"
import type { ShipmentStatusFilter } from "./shipment-status"

export function useShipmentStatusFilter<TShipment extends Pick<Shipment, "status">>(
  shipments: readonly TShipment[]
) {
  const [filter, setFilter] = useState<ShipmentStatusFilter>("all")
  const visibleShipments =
    filter === "all" ? shipments : shipments.filter((shipment) => shipment.status === filter)

  return { filter, setFilter, visibleShipments }
}
