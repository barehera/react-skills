import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Toaster } from "@/components/ui/sonner"
import type { Viewer } from "@/features/tasks/types"
import { ViewerContext } from "@/hooks/use-viewer"

export function Providers({
  viewer,
  children,
}: {
  viewer: Viewer
  children: React.ReactNode
}) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>
      <Toaster />
    </QueryClientProvider>
  )
}
