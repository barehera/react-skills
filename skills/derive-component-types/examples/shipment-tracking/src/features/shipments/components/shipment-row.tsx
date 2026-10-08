import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"

import { Timestamp } from "../../../components/ui/timestamp"
import type { Shipment } from "../server-state/types"

type ShipmentRowProps = {
  shipment: Pick<
    Shipment,
    "trackingCode" | "status" | "estimatedArrival" | "carrier"
  >
}

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

const shipmentStatusBadges = {
  pending: { label: "Pending", variant: "outline" },
  in_transit: { label: "In transit", variant: "secondary" },
  delivered: { label: "Delivered", variant: "default" },
} satisfies Record<Shipment["status"], { label: string; variant: BadgeVariant }>

export function ShipmentRow({ shipment }: ShipmentRowProps) {
  const statusBadge = shipmentStatusBadges[shipment.status]

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>{shipment.trackingCode}</ItemTitle>
        <ItemDescription>{shipment.carrier.name}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Timestamp value={shipment.estimatedArrival} />
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
      </ItemActions>
    </Item>
  )
}
