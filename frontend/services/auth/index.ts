// // Auth service - switches between mock and real based on environment
// const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"
//
// export type { User, AuthResponse } from "./mockAuth"
//
// export const authService = USE_MOCK ? require("./mockAuth") : require("./realAuth")
//
// export const { login, signup, forgotPassword, getCurrentUser, logout } = authService

// Determine whether to use mock or real service
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

// Export types from mockAuth (both mock and real share the same interface)
export type { User, AuthResponse } from "./mockAuth"

// Import the appropriate service
import * as mockAuth from "./mockAuth"
import * as realAuth from "./realAuth"

const authService = USE_MOCK ? mockAuth : realAuth

// Export the functions
export const { login, signup, forgotPassword, getCurrentUser, logout } = authService
