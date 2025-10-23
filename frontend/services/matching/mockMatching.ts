// Mock matching service
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

const MOCK_MATCHES: MatchResult[] = [
  { id: "1", name: "Alicia", avatar: "" },
  { id: "2", name: "Ryan", avatar: "" },
  { id: "3", name: "Daniel", avatar: "" },
]

export async function findMatches(criteria: MatchCriteria): Promise<MatchResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Filter based on criteria (simplified mock logic)
  if (criteria.languages.length === 0 && criteria.difficulties.length === 0 && criteria.topics.length === 0) {
    return []
  }

  return MOCK_MATCHES
}

export async function matchWithUser(userId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log(`Matched with user ${userId}`)
}
