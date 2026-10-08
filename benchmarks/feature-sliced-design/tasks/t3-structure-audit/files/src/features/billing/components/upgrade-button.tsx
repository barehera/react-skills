import * as React from "react"

import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/lib/billing"
import { useProjectQuery } from "@/server-state/project-queries"

const PRO_PRICE_ID = "price_pro_monthly"

export function UpgradeButton({ projectId }: { projectId: string }) {
  const projectQuery = useProjectQuery(projectId)
  const [isRedirecting, setIsRedirecting] = React.useState(false)

  if (projectQuery.data?.plan !== "free") return null

  async function upgrade() {
    setIsRedirecting(true)
    window.location.href = await createCheckoutSession(projectId, PRO_PRICE_ID)
  }

  return (
    <Button disabled={isRedirecting} onClick={upgrade}>
      Upgrade to Pro
    </Button>
  )
}
