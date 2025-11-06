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
  question?: MatchQuestion | null
}

export interface MatchQuestionExample {
  input?: string
  output?: string
  explanation?: string
  [key: string]: unknown
}

export interface MatchQuestion {
  id?: number
  title: string
  description: string
  descriptionImages?: string[]
  constraints?: string[]
  examples?: MatchQuestionExample[] | null
  solution?: string | null
  difficulty?: string | null
  language?: string | null
  topic?: string | null
  followUp?: string | null
  createdAt?: string
  [key: string]: unknown
}

export interface MatchSession {
  sessionId?: string
  roomId: string
  partnerId: string
  partnerUsername?: string
  difficulty?: string | null
  topic?: string | null
  question?: MatchQuestion | null
  createdAt?: number
}
