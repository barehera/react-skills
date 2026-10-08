export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent("acme:analytics", { detail: { event, properties } })
  )
}
