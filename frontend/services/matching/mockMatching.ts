// Mock matching service simulates queue behaviour without a backend
import {
  MatchCriteria,
  MatchResult,
  MatchSearchOutcome,
  MatchQuestion,
  MatchSession,
} from "./types"

const MOCK_MATCHES: MatchResult[] = [
  { id: "1", name: "Alicia" },
  { id: "2", name: "Ryan" },
  { id: "3", name: "Daniel" },
]

const MOCK_QUESTION: MatchQuestion = {
  id: 1,
  title: "Mock Two Sum",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] == 9",
    },
  ],
  difficulty: "EASY",
  topic: "Array",
}

let mockRoomId: string | null = null
let mockSession: MatchSession | null = null

export async function findMatches(
  _criteria: MatchCriteria,
  onProgress?: (message: string) => void
): Promise<MatchSearchOutcome> {
  if (onProgress) onProgress("Searching for mock match...")
  await new Promise((resolve) => setTimeout(resolve, 300))
  return {
    matches: MOCK_MATCHES,
    roomId: mockRoomId ?? undefined,
    question: mockSession?.question ?? null,
  }
}

export async function matchWithUser(userId: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  console.log(`Mock matched with user ${userId}`)
  mockRoomId = "mock-room"
  mockSession = {
    sessionId: "session-mock-room",
    roomId: mockRoomId,
    partnerId: userId,
    partnerUsername: `User ${userId}`,
  difficulty: "EASY",
  topic: "Array",
    question: MOCK_QUESTION,
    attemptId: null,
    createdAt: Date.now(),
  }
  return mockRoomId
}

export async function cancelMatching(): Promise<void> {
  mockRoomId = null
  mockSession = null
  await new Promise((resolve) => setTimeout(resolve, 100))
}

export async function getActiveSession(): Promise<MatchSession | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return mockSession
}

export async function leaveSession(): Promise<void> {
  mockRoomId = null
  mockSession = null
  await new Promise((resolve) => setTimeout(resolve, 50))
}
