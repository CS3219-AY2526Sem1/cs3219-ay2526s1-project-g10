import * as mockMatching from "./mockMatching"
import * as realMatching from "./realMatching"

// Matching service - switches between mock and real based on environment
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export type { MatchResult, MatchCriteria, MatchSearchOutcome } from "./types"

const matchingService = USE_MOCK ? mockMatching : realMatching

export const { findMatches, matchWithUser, cancelMatching } = matchingService
