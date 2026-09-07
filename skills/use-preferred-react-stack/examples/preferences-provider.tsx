"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useStore } from "zustand"
import type { StateStorage } from "zustand/middleware"
import { createPreferencesStore, type PreferencesStore } from "./preferences-store"

const browserStorage: StateStorage = {
  getItem: name => localStorage.getItem(name),
  setItem: (name, value) => localStorage.setItem(name, value),
  removeItem: name => localStorage.removeItem(name),
}
const PreferencesContext = createContext<PreferencesStore | null>(null)

export function PreferencesProvider({ children, storageKey }: {
  children: ReactNode
  storageKey: string
}) {
  const [store] = useState(() => createPreferencesStore(browserStorage, storageKey))
  useEffect(() => { void store.persist.rehydrate() }, [store])
  return <PreferencesContext.Provider value={store}>{children}</PreferencesContext.Provider>
}

export function usePreferences<T>(selector: (state: ReturnType<PreferencesStore["getState"]>) => T): T {
  const store = useContext(PreferencesContext)
  if (!store) throw new Error("usePreferences requires PreferencesProvider")
  return useStore(store, selector)
}
