import * as mockMatching from "./mockMatching"
import * as realMatching from "./realMatching"

// Matching service - switches between mock and real based on environment
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export type { MatchResult, MatchCriteria, MatchSearchOutcome, MatchQuestion, MatchSession, MatchQuestionExample } from "./types"

const matchingService = USE_MOCK ? mockMatching : realMatching

export const { findMatches, matchWithUser, cancelMatching, getActiveSession, leaveSession } = matchingService

export {
  createCustomRoom,
  joinCustomRoom,
  getCustomRoomInfo,
  leaveCustomRoom,
} from "./customMatching"

export type {
  CustomRoomCreateRequest,
  CustomRoomCreateResponse,
  CustomRoomJoinRequest,
  CustomRoomJoinResponse,
  CustomRoomParticipant,
  CustomRoomInfo,
} from "./customMatching"