"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser, logout, type User } from "../services/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  isAdmin: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const signOut = async () => {
    try {
      await logout()
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const refreshUser = async () => {
    setLoading(true)
    await fetchUser()
  }

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isAdmin, refreshUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
