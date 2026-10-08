import * as React from "react"

import type { Viewer } from "@/features/tasks/types"

export const ViewerContext = React.createContext<Viewer | null>(null)

export function useViewer() {
  const viewer = React.useContext(ViewerContext)

  if (!viewer) {
    throw new Error("useViewer must be used inside ViewerContext.")
  }

  return viewer
}
