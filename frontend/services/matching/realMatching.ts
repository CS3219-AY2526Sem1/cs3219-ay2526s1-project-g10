// Real matching service (with Supabase authentication support)

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface MatchResult {
  id: string
  name: string
  username?: string
  avatar?: string
}

export interface MatchCriteria {
  difficulties: string | null
  topics: string | null
}

interface BackendMatchResponse {
  matchFound: boolean
  matchedWith?: {
    userId: string
    difficulty: string
    topic: string
    joinedAt: number
    matched: boolean
  }
  message?: string
  timeout?: boolean
  waitTime?: number
}

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  return user.id
}

// Helper to call the backend
async function callMatchAPI(userId: string, difficulty: string, topic: string): Promise<BackendMatchResponse> {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch("http://localhost:3002/api/match", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token || ""}`,
    },
    body: JSON.stringify({
      userId,
      difficulty,
      topic,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch matches")
  }

  return response.json()
}

export async function findMatches(
  criteria: MatchCriteria,
  onProgress?: (message: string) => void
): Promise<MatchResult[]> {
  const userId = await getCurrentUserId()
  const difficulty = criteria.difficulties!
  const topic = criteria.topics!

  try {
    if (onProgress) onProgress("Searching for match...")

    const initialResponse = await callMatchAPI(userId, difficulty, topic)

    // Immediate match found
    if (initialResponse.matchFound && initialResponse.matchedWith) {
      return [
        {
          id: initialResponse.matchedWith.userId,
          name: initialResponse.matchedWith.username || `User ${initialResponse.matchedWith.userId}`,
          username: initialResponse.matchedWith.username,
          avatar: "",
        },
      ]
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
        return [
          {
            id: checkResponse.matchedWith.userId,
            name: checkResponse.matchedWith.username || `User ${checkResponse.matchedWith.userId}`,
            username: checkResponse.matchedWith.username,
            avatar: "",
          },
        ]
      }
    }

    // Timeout, no match found
    if (onProgress) onProgress("No match found after 60 seconds")
    return []

  } catch (error) {
    console.error("Error in findMatches:", error)
    throw error
  }
}

export async function matchWithUser(userId: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    const response = await fetch(`http://localhost:3002/api/match/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || ""}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to match with user")
    }
  } catch (error) {
    console.error("Error in matchWithUser:", error)
    throw error
  }
}

export async function cancelMatching(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch("http://localhost:3002/api/match/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || ""}`,
      },
    })
  } catch (error) {
    console.error("Error cancelling match:", error)
  }
}