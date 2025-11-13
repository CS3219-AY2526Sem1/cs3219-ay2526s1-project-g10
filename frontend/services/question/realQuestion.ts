// Real question service
export interface Question {
  id: number
  title: string
  description: string
  descriptionImages: string[]
  constraints: string[]
  examples: any
  solution: string
  difficulty: "Easy" | "Medium" | "Hard"
  language?: string | null
  topic: string
  followUp?: string | null
  createdAt?: string
}

export interface QuestionListResponse {
  questions: Question[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export type QuestionPayload = {
  title: string
  description: string
  descriptionImages?: string[]
  constraints?: string[]
  examples?: any
  solution: string
  difficulty: "Easy" | "Medium" | "Hard"
  language?: string | null
  topic: string
  followUp?: string | null
}

export type QuestionUpdatePayload = Partial<QuestionPayload>

import { getRuntimeEnv, resolveGatewayBase, stripTrailingSlash } from "../../lib/runtimeEnv"

const gatewayBase = stripTrailingSlash(resolveGatewayBase())
const questionServiceOverride = getRuntimeEnv("NEXT_PUBLIC_QUESTION_SERVICE_URL")
const questionServiceBase = questionServiceOverride ? stripTrailingSlash(questionServiceOverride) : undefined

function mapDifficulty(difficulty: string): "Easy" | "Medium" | "Hard" {
  const map: Record<string, "Easy" | "Medium" | "Hard"> = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
  }

  return map[difficulty] ?? "Easy"
}

function toApiDifficulty(difficulty: string): "EASY" | "MEDIUM" | "HARD" {
  const upper = difficulty.trim().toUpperCase()
  if (upper !== "EASY" && upper !== "MEDIUM" && upper !== "HARD") {
    throw new Error("Difficulty must be Easy, Medium or Hard")
  }
  return upper as "EASY" | "MEDIUM" | "HARD"
}

function transformQuestion(payload: any): Question {
  return {
    id: Number(payload.id),
    title: payload.title,
    description: payload.description,
    descriptionImages: Array.isArray(payload.descriptionImages) ? payload.descriptionImages : [],
    constraints: Array.isArray(payload.constraints) ? payload.constraints : [],
    examples: payload.examples ?? null,
    solution: payload.solution,
    difficulty: mapDifficulty(payload.difficulty),
    language: payload.language ?? null,
    topic: payload.topic,
    followUp: payload.followUp ?? null,
    createdAt: payload.createdAt ?? undefined,
  }
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const token = window.localStorage.getItem("auth_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function buildRequestPayload(input: QuestionPayload | QuestionUpdatePayload): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (input.title !== undefined) payload.title = input.title
  if (input.description !== undefined) payload.description = input.description
  if (input.solution !== undefined) payload.solution = input.solution
  if (input.difficulty !== undefined) payload.difficulty = toApiDifficulty(input.difficulty)
  if (input.topic !== undefined) payload.topic = input.topic
  if (input.language !== undefined) payload.language = input.language ?? null
  if (input.followUp !== undefined) payload.followUp = input.followUp ?? null
  if (input.descriptionImages !== undefined) payload.descriptionImages = input.descriptionImages
  if (input.constraints !== undefined) payload.constraints = input.constraints
  if (input.examples !== undefined) payload.examples = input.examples ?? null

  return payload
}

async function parseResponse(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch (error) {
    return text
  }
}

function buildApiUrl(path: string): string {
  const base = questionServiceBase ?? gatewayBase
  if (!base) {
    throw new Error("Question service URL is not configured")
  }
  return `${base}${path}`
}

function ensureBaseUrl(): string {
  const base = questionServiceBase ?? gatewayBase
  if (!base) {
    throw new Error("Question service URL is not configured")
  }
  return base
}

export async function getQuestion(id: string): Promise<Question | null> {
  try {
    const response = await fetch(buildApiUrl(`/questions/${id}`), {
      headers: {
        ...getAuthHeaders(),
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch question")
    }

    const data = await response.json()
    return transformQuestion(data)
  } catch (error) {
    console.error("Error fetching question:", error)
    throw error
  }
}
// export async function getQuestions(filters?: {
//   difficulty?: string
//   search?: string
// }): Promise<Question[]> {
//   try {
//     const params = new URLSearchParams()
//
//     const token = localStorage.getItem("auth_token")
//
//     const response = await fetch(`${API_URL}/questions${params.toString() ? `?${params}` : ""}`, {
//       headers: {
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//     })
//
//     if (!response.ok) {
//       throw new Error("Failed to fetch questions")
//     }
//
//     const data = await response.json()
//
//     let questions = Array.isArray(data) ? data : [data]
//
//     questions = questions.map(transformQuestion)
//
//     if (filters?.search) {
//       const searchLower = filters.search.toLowerCase()
//       questions = questions.filter((q) =>
//         q.title.toLowerCase().includes(searchLower) ||
//         q.description.toLowerCase().includes(searchLower) ||
//         q.topics.some(t => t.toLowerCase().includes(searchLower))
//       )
//     }
//
//     return questions
//   } catch (error) {
//     console.error("Error fetching questions:", error)
//     throw error
//   }
// }

export async function getQuestions(params?: {
  page?: number
  limit?: number
  search?: string
  difficulty?: string
  topic?: string
}): Promise<QuestionListResponse> {
  const baseUrl = ensureBaseUrl()
  const searchParams = new URLSearchParams()

  const page = params?.page ?? 1
  const limit = params?.limit ?? 20

  searchParams.set("page", String(page))
  searchParams.set("limit", String(limit))

  if (params?.search) searchParams.set("search", params.search)
  if (params?.topic) searchParams.set("topic", params.topic)
  if (params?.difficulty) searchParams.set("difficulty", params.difficulty)

  const response = await fetch(`${baseUrl}/questions?${searchParams}`, {
    headers: {
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    const body = await parseResponse(response)
    console.error("Failed to fetch questions", body)
    throw new Error(typeof body === "string" ? body : body?.error ?? "Failed to fetch questions")
  }

  const payload = await response.json()

  return {
    questions: Array.isArray(payload.questions) ? payload.questions.map(transformQuestion) : [],
    totalCount: payload.totalCount ?? 0,
    totalPages: payload.totalPages ?? 1,
    currentPage: payload.currentPage ?? page,
  }
}

export async function createQuestion(input: QuestionPayload): Promise<Question> {
  const baseUrl = ensureBaseUrl()
  const response = await fetch(`${baseUrl}/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(buildRequestPayload(input)),
  })

  if (!response.ok) {
    const body = await parseResponse(response)
    throw new Error(typeof body === "string" ? body : body?.error ?? "Failed to create question")
  }

  const payload = await response.json()
  return transformQuestion(payload)
}

export async function updateQuestion(id: number, updates: QuestionUpdatePayload): Promise<Question> {
  const baseUrl = ensureBaseUrl()
  const response = await fetch(`${baseUrl}/questions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(buildRequestPayload(updates)),
  })

  if (!response.ok) {
    const body = await parseResponse(response)
    throw new Error(typeof body === "string" ? body : body?.error ?? "Failed to update question")
  }

  const payload = await response.json()
  return transformQuestion(payload)
}

export async function deleteQuestion(id: number): Promise<void> {
  const baseUrl = ensureBaseUrl()
  const response = await fetch(`${baseUrl}/questions/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    const body = await parseResponse(response)
    throw new Error(typeof body === "string" ? body : body?.error ?? "Failed to delete question")
  }
}

