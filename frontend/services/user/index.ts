// Determine whether to use mock or real service
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

// Export types from mockUser (both mock and real share the same interface)
export type { UserProfile } from "./mockUser"

// Import the appropriate service based on USE_MOCK
import * as mockUser from "./mockUser"
import * as realUser from "./realUser"

const userService = USE_MOCK ? mockUser : realUser

// Export the functions
export const { getUserProfile, updateUserProfile } = userService
