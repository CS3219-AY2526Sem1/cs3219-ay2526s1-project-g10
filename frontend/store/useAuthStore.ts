import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { getCurrentUser, logout } from "../services/auth"

type AuthUser = Awaited<ReturnType<typeof getCurrentUser>>

interface AuthState {
  user: AuthUser
  loading: boolean
  isAdmin: boolean
  initialized: boolean
  refreshUser: () => Promise<void>
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null as AuthUser,
      loading: true,
      isAdmin: false,
      initialized: false,
      refreshUser: async () => {
        set({ loading: true })
        try {
          const currentUser = await getCurrentUser()
          set({
            user: currentUser,
            isAdmin: currentUser?.role === "admin",
          })
        } catch (error) {
          console.error("Error fetching user:", error)
          set({ user: null, isAdmin: false })
        } finally {
          set({ loading: false })
        }
      },
      initialize: async () => {
        if (get().initialized) {
          return
        }
        await get().refreshUser()
        set({ initialized: true })
      },
      signOut: async () => {
        try {
          await logout()
        } catch (error) {
          console.error("Error signing out:", error)
        } finally {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("auth_token")
            window.localStorage.removeItem("user")
          }
          set({ user: null, isAdmin: false, loading: false, initialized: true })
        }
      },
    }),
    {
      name: "auth-store",
      storage: typeof window !== "undefined" ? createJSONStorage<AuthState>(() => window.localStorage) : undefined,
      partialize: (state) =>
        ({
          user: state.user,
          isAdmin: state.isAdmin,
          loading: false,
          initialized: state.initialized,
          refreshUser: state.refreshUser,
          initialize: state.initialize,
          signOut: state.signOut,
        }) as AuthState,
    }
  )
)
