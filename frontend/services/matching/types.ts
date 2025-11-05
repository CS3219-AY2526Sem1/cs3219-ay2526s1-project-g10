export interface MatchResult {
  id: string
  name: string
  username?: string
  avatar?: string
  roomId?: string
}

export interface MatchCriteria {
  difficulties: string | null
  topics: string | null
}

export interface MatchSearchOutcome {
  matches: MatchResult[]
  roomId?: string
}
