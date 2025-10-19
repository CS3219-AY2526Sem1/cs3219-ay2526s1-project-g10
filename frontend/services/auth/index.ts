// Auth service - switches between mock and real based on environment
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export type { User, AuthResponse } from "./mockAuth"

export const authService = USE_MOCK ? require("./mockAuth") : require("./realAuth")

export const { login, signup, forgotPassword, getCurrentUser, logout } = authService
