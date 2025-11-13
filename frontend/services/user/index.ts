// Determine whether to use mock or real service
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export type { UserProfile } from "./types"

import * as mockUser from "./mockUser"
import * as realUser from "./realUser"

const userService = USE_MOCK ? mockUser : realUser

export const { getUserProfile, updateUserProfile } = userService
