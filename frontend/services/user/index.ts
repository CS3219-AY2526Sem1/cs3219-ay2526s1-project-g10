// User service - switches between mock and real based on environment
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export type { UserProfile } from "./mockUser"

export const userService = USE_MOCK ? require("./mockUser") : require("./realUser")

export const { getUserProfile, updateUserProfile } = userService
