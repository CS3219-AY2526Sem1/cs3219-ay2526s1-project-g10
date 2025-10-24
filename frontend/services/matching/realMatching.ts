// Real matching service
export interface MatchResult {
  id: string
  name: string
  avatar: string
}

export interface MatchCriteria {
  languages: string[]
  difficulties: string[]
  topics: string[]
}

export async function findMatches(criteria: MatchCriteria): Promise<MatchResult[]> {
  const response = await fetch("/api/matches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(criteria),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch matches")
  }

  return response.json()
}

export async function matchWithUser(userId: string): Promise<void> {
  const response = await fetch(`/api/matches/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to match with user")
  }
}
