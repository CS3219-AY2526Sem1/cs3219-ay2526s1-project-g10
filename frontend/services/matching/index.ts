// Matching service - switches between mock and real based on environment
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export type { MatchResult, MatchCriteria } from "./mockMatching"

export const matchingService = USE_MOCK ? require("./mockMatching") : require("./realMatching")

export const { findMatches, matchWithUser } = matchingService
