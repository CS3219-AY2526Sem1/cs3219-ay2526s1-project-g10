// Mock matching service simulates queue behaviour without a backend
import { MatchCriteria, MatchResult, MatchSearchOutcome } from "./types"

const MOCK_MATCHES: MatchResult[] = [
  { id: "1", name: "Alicia" },
  { id: "2", name: "Ryan" },
  { id: "3", name: "Daniel" },
]

let mockRoomId: string | null = null

export async function findMatches(
  _criteria: MatchCriteria,
  onProgress?: (message: string) => void
): Promise<MatchSearchOutcome> {
  if (onProgress) onProgress("Searching for mock match...")
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { matches: MOCK_MATCHES, roomId: mockRoomId ?? undefined }
}

export async function matchWithUser(userId: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  console.log(`Mock matched with user ${userId}`)
  mockRoomId = "mock-room"
  return mockRoomId
}

export async function cancelMatching(): Promise<void> {
  mockRoomId = null
  await new Promise((resolve) => setTimeout(resolve, 100))
}
