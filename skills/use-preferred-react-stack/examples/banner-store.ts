import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

const initialState: { dismissedId: string | null } = { dismissedId: null }
type BannerState = typeof initialState & {
  dismiss: (id: string) => void
  reset: () => void
}

export const useBannerStore = create<BannerState>()(persist(
  set => ({
    ...initialState,
    dismiss: dismissedId => set({ dismissedId }),
    reset: () => set({ ...initialState }),
  }),
  {
    name: "dismissed-banner",
    storage: createJSONStorage(() => localStorage),
    partialize: state => ({ dismissedId: state.dismissedId }),
  },
))
