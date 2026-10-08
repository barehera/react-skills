"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import { ItemGroup } from "@/components/ui/item"

import { useShipmentsQuery } from "../server-state/queries/use-shipments-query"
import { ShipmentRow } from "./shipment-row"

export function ShipmentList() {
  const shipmentsQuery = useShipmentsQuery()

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
    <ItemGroup>
      {shipmentsQuery.data.map((shipment) => (
        <ShipmentRow key={shipment.id} shipment={shipment} />
      ))}
    </ItemGroup>
  )
}
