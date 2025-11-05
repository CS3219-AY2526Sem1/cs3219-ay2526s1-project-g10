import { isAxiosError } from "axios"
import { matchClient } from "../../network/axiosClient"
import { useAuthStore } from "../../store/useAuthStore"
import {
  MatchCriteria,
  MatchResult,
  MatchSearchOutcome,
  MatchQuestion,
  MatchSession,
} from "./types"

interface BackendMatchResponse {
  matchFound: boolean
  matchedWith?: {
    userId: string
    username?: string
    difficulty: string
    topic: string
    joinedAt: number
    matched: boolean
  }
  message?: string
  timeout?: boolean
  waitTime?: number
  roomId?: string
  sessionReady?: boolean
  question?: MatchQuestion | null
}

interface ConfirmMatchResponse {
  success: boolean
  sessionId: string
  partnerId: string
  roomId: string
  question?: MatchQuestion | null
  difficulty?: string | null
  topic?: string | null
}

interface ActiveSessionResponse extends MatchSession {
  sessionId: string
}

async function requireUserId(): Promise<string> {
  const store = useAuthStore.getState()

  if (store.user?.id) {
    return store.user.id
  }

  await store.refreshUser()
  const refreshed = useAuthStore.getState().user
  if (refreshed?.id) {
    return refreshed.id
  }

  throw new Error("User not authenticated")
}

// Helper to call the backend
async function callMatchAPI(userId: string, difficulty: string, topic: string): Promise<BackendMatchResponse> {
  try {
    const response = await matchClient.post<BackendMatchResponse>("/api/match", {
      userId,
      difficulty,
      topic,
    })

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      const message = (error.response?.data as { error?: string; message?: string } | undefined)?.error
        ?? error.response?.data?.message
        ?? error.message
        ?? "Failed to fetch matches"
      throw new Error(message)
    }
    throw error
  }
}

function toMatchResult(payload: { userId: string; username?: string; difficulty: string; topic: string }, roomId?: string): MatchResult {
  return {
    id: payload.userId,
    name: payload.username || `User ${payload.userId}`,
    username: payload.username,
    avatar: "",
    roomId,
  }
}

export async function findMatches(
  criteria: MatchCriteria,
  onProgress?: (message: string) => void
): Promise<MatchSearchOutcome> {
  const userId = await requireUserId()
  const difficulty = criteria.difficulties!
  const topic = criteria.topics!

  try {
    if (onProgress) onProgress("Searching for match...")

    const initialResponse = await callMatchAPI(userId, difficulty, topic)

    // Immediate match found
    if (initialResponse.matchFound && initialResponse.matchedWith) {
      const match = toMatchResult(initialResponse.matchedWith, initialResponse.roomId)
      return {
        matches: [match],
        roomId: initialResponse.roomId,
        question: initialResponse.question ?? null,
      }
    }

    // No immediate match
    // poll every 5 seconds for up to 60 seconds
    const startTime = Date.now()
    const maxWaitTime = 65000 // 65 seconds

    while (Date.now() - startTime < maxWaitTime) {
      // Wait 5 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const elapsed = Math.floor((Date.now() - startTime) / 1000)

      if (elapsed < 30) {
        if (onProgress) onProgress(`Searching by difficulty... (${elapsed}s)`)
      } else {
        if (onProgress) onProgress(`Searching by topic... (${elapsed}s)`)
      }

      // Check if match was made
      const checkResponse = await callMatchAPI(userId, difficulty, topic)

      if (checkResponse.matchFound && checkResponse.matchedWith) {
        const match = toMatchResult(checkResponse.matchedWith, checkResponse.roomId)
        return {
          matches: [match],
          roomId: checkResponse.roomId,
          question: checkResponse.question ?? null,
        }
      }
    }

    // Timeout, no match found
    if (onProgress) onProgress("No match found after 60 seconds")
    return { matches: [] }

  } catch (error) {
    console.error("Error in findMatches:", error)
    throw error
  }
}

export async function matchWithUser(userId: string): Promise<string> {
  try {
  const response = await matchClient.post<ConfirmMatchResponse>(`/api/match/${userId}`)
    const roomId = response.data.roomId
    if (!roomId) {
      throw new Error("No collaboration room assigned yet")
    }
    return roomId
  } catch (error) {
    if (isAxiosError(error)) {
      const message = (error.response?.data as { error?: string; message?: string } | undefined)?.error
        ?? error.response?.data?.message
        ?? error.message
        ?? "Failed to match with user"
      throw new Error(message)
    }
    console.error("Error in matchWithUser:", error)
    throw error
  }
}

export async function cancelMatching(): Promise<void> {
  try {
    await matchClient.post("/api/match/cancel")
  } catch (error) {
    if (isAxiosError(error)) {
      const message = (error.response?.data as { error?: string; message?: string } | undefined)?.error
        ?? error.response?.data?.message
        ?? error.message
        ?? "Error cancelling match"
      throw new Error(message)
    }
    console.error("Error cancelling match:", error)
  }
}

export async function getActiveSession(): Promise<MatchSession> {
  try {
    const response = await matchClient.get<ActiveSessionResponse>("/api/match/session")
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      const message = (error.response?.data as { error?: string; message?: string } | undefined)?.error
        ?? error.response?.data?.message
        ?? error.message
        ?? "Failed to fetch active session"
      throw new Error(message)
    }
    throw error
  }
}