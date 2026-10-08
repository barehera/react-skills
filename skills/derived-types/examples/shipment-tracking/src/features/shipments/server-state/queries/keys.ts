export const shipmentKeys = {
  all: ["shipments"] as const,
  list: () => [...shipmentKeys.all, "list"] as const,
}
