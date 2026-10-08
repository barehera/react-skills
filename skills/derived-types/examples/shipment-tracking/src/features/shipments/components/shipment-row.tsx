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
import { shipmentStatusLabels } from "../model/shipment-status"
import type { Shipment } from "../server-state/types"

type ShipmentRowProps = {
  shipment: Pick<
    Shipment,
    "trackingCode" | "status" | "estimatedArrival" | "carrier"
  >
}

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

const shipmentStatusVariants = {
  pending: "outline",
  in_transit: "secondary",
  delivered: "default",
} satisfies Record<Shipment["status"], BadgeVariant>

export function ShipmentRow({ shipment }: ShipmentRowProps) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>{shipment.trackingCode}</ItemTitle>
        <ItemDescription>{shipment.carrier.name}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Timestamp value={shipment.estimatedArrival} />
        <Badge variant={shipmentStatusVariants[shipment.status]}>
          {shipmentStatusLabels[shipment.status]}
        </Badge>
      </ItemActions>
    </Item>
  )
}
