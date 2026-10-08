import * as z from "zod"

export const shipmentStatusSchema = z.enum(["pending", "in_transit", "delivered"])

export const shipmentSchema = z.object({
  id: z.string(),
  trackingCode: z.string(),
  status: shipmentStatusSchema,
  estimatedArrival: z.iso.datetime(),
  carrier: z.object({ name: z.string() }),
})

export const shipmentListSchema = z.array(shipmentSchema)
