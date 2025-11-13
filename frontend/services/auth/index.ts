// Auth service - switches between mock and real based on environment
// Determine whether to use mock or real service
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

// Export types from realAuth (both mock and real share the same interface)
export type { User, AuthResponse } from "./realAuth"

// Import the appropriate service
import * as mockAuth from "./mockAuth"
import * as realAuth from "./realAuth"

const authService = USE_MOCK ? mockAuth : realAuth

// Export the functions
export const { login, signup, forgotPassword, getCurrentUser, logout } = authService
