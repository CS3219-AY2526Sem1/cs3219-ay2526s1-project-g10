"use client"

import type React from "react"
import { useEffect, useMemo } from "react"
import { useAuthStore } from "../store/useAuthStore"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return <>{children}</>
}

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const signOut = useAuthStore((state) => state.signOut)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const refreshUser = useAuthStore((state) => state.refreshUser)

  return useMemo(
    () => ({ user, loading, signOut, isAdmin, refreshUser }),
    [user, loading, signOut, isAdmin, refreshUser]
  )
}

export { useAuthStore }
