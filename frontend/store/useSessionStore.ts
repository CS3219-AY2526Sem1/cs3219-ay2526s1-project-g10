"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { MatchSession } from "../services/matching"

interface SessionState {
  session: MatchSession | null
  setSession: (session: MatchSession | null) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: "peerprep-active-session",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage<{ session: MatchSession | null }>(() => window.localStorage)
          : undefined,
      partialize: (state) => ({ session: state.session }),
    }
  )
)
