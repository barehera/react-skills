import * as React from "react"

export type Session =
  | { status: "loading" }
  | { status: "authenticated"; userId: string }
  | { status: "unauthenticated" }

export const SessionContext = React.createContext<Session>({ status: "loading" })

export function useSession() {
  return React.useContext(SessionContext)
}
