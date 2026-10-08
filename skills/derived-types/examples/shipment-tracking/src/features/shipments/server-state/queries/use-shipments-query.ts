"use client"

import { useQuery } from "@tanstack/react-query"

import { shipmentListOptions } from "./options"

export function useShipmentsQuery() {
  return useQuery(shipmentListOptions())
}
