// History service - switches between mock and real based on environment
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export type { Attempt, AdminAttempt } from "./realHistory"

export const historyService = USE_MOCK ? require("./mockHistory") : require("./realHistory")

export const { getUserAttempts, getAllAttempts } = historyService
