import { env } from "@/config/env"

export async function createCheckoutSession(projectId: string, priceId: string) {
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      client_reference_id: projectId,
      success_url: `${window.location.origin}/projects/${projectId}/billing`,
    }),
  })

  const session = (await response.json()) as { url: string }
  return session.url
}
