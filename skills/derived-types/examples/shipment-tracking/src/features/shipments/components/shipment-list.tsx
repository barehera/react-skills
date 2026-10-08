"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import { ItemGroup } from "@/components/ui/item"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import {
  isShipmentStatusFilter,
  shipmentStatusFilters,
  shipmentStatusLabels,
} from "../model/shipment-status"
import { useShipmentStatusFilter } from "../model/use-shipment-status-filter"
import { useShipmentsQuery } from "../server-state/queries/use-shipments-query"
import { ShipmentRow } from "./shipment-row"

export function ShipmentList() {
  const shipmentsQuery = useShipmentsQuery()
  const { filter, setFilter, visibleShipments } = useShipmentStatusFilter(
    shipmentsQuery.data ?? []
  )

  if (shipmentsQuery.isPending) {
    return (
      <Empty>
        <EmptyTitle>Loading shipments</EmptyTitle>
      </Empty>
    )
  }

  if (shipmentsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Shipments unavailable</AlertTitle>
        <AlertDescription>{shipmentsQuery.error.message}</AlertDescription>
      </Alert>
    )
  }

  if (shipmentsQuery.data.length === 0) {
    return (
      <Empty>
        <EmptyTitle>No shipments yet</EmptyTitle>
        <EmptyDescription>
          Shipments appear here once an order is dispatched.
        </EmptyDescription>
      </Empty>
    )
  }

  return (
    <section className="grid gap-4">
      <ToggleGroup
        type="single"
        variant="outline"
        aria-label="Filter shipments by status"
        value={filter}
        onValueChange={(value) => {
          if (isShipmentStatusFilter(value)) setFilter(value)
        }}
      >
        {shipmentStatusFilters.map((statusFilter) => (
          <ToggleGroupItem key={statusFilter} value={statusFilter}>
            {shipmentStatusLabels[statusFilter]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {visibleShipments.length === 0 ? (
        <Empty>
          <EmptyTitle>No matching shipments</EmptyTitle>
        </Empty>
      ) : (
        <ItemGroup>
          {visibleShipments.map((shipment) => (
            <ShipmentRow key={shipment.id} shipment={shipment} />
          ))}
        </ItemGroup>
      )}
    </section>
  )
}
