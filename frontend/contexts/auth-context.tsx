"use client"

import type React from "react"
import { useEffect } from "react"
import { useAuthStore } from "../store/useAuthStore"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return <>{children}</>
}

export function useAuth() {
  return useAuthStore((state) => ({
    user: state.user,
    loading: state.loading,
    signOut: state.signOut,
    isAdmin: state.isAdmin,
    refreshUser: state.refreshUser,
  }))
}

export { useAuthStore }
