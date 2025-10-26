// Real matching service
export interface MatchResult {
  id: string
  name: string
  avatar: string
}

export interface MatchCriteria {
  // languages: string[]
  difficulties: string[]
  topics: string[]
}

export async function findMatches(criteria: MatchCriteria): Promise<MatchResult[]> {
  const response = await fetch("http://localhost:3003/api/match", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify({
      userId: "A123",  // later: dynamic
      difficulty: criteria.difficulties,
      topic: criteria.topics,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch matches")
  }

  return response.json()
}

export async function matchWithUser(userId: string): Promise<void> {
  const response = await fetch(`http://localhost:3003/api/match/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to match with user")
  }
}
