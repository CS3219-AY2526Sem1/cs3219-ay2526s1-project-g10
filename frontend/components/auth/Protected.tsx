"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "../../store/useAuthStore"

export function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const initialize = useAuthStore((state) => state.initialize)
  const initialized = useAuthStore((state) => state.initialized)

  useEffect(() => {
    if (!initialized) {
      void initialize()
    }
  }, [initialize, initialized])

  useEffect(() => {

    if (!loading && !user) {
      router.replace(`/user/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [loading, user, router, pathname])

  if (loading || !user) {
    return null
  }

  return <>{children}</>
}

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const loading = useAuthStore((state) => state.loading)
  const initialize = useAuthStore((state) => state.initialize)
  const initialized = useAuthStore((state) => state.initialized)

  useEffect(() => {
    if (!initialized) {
      void initialize()
    }
  }, [initialize, initialized])

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/user/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (!loading && user && !isAdmin) {
      router.replace("/unauthorized")
    }
  }, [loading, user, isAdmin, router, pathname])

  if (loading || !user || !isAdmin) {
    return null
  }

  return <>{children}</>
}
