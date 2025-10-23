// Admin service - switches between mock and real based on environment
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export type { AdminUser, AdminStats } from "./mockAdmin"

export const adminService = USE_MOCK ? require("./mockAdmin") : require("./realAdmin")

export const { getAdminStats, getAllUsers, deleteUser, updateUserRole } = adminService
