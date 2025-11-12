// Real history service
import { MatchQuestion } from "../matching"
import { getRuntimeEnv, resolveGatewayBase, stripTrailingSlash } from "../../lib/runtimeEnv"

export interface Attempt {
  id: number
  userId: string
  questionId: number | null
  questionJson?: MatchQuestion | null
  attemptedAt: string
  status: "COMPLETED" | "PENDING"
  code?: string | null
  output?: string | null
  // Optional client-only fields populated after fetching question metadata
  questionTitle?: string
  difficulty?: "Easy" | "Medium" | "Hard"
}

const gatewayBase = stripTrailingSlash(resolveGatewayBase())
const questionServiceOverride = getRuntimeEnv("NEXT_PUBLIC_QUESTION_SERVICE_URL")
const questionServiceBase = questionServiceOverride ? stripTrailingSlash(questionServiceOverride) : undefined

function resolveHistoryUrl(gatewayPath: string, questionServicePath: string): string {
  if (gatewayBase && gatewayBase.length > 0) {
    return `${gatewayBase}${gatewayPath}`
  }
  if (questionServiceBase && questionServiceBase.length > 0) {
    return `${questionServiceBase}${questionServicePath}`
  }
  throw new Error("History service URL is not configured")
}

function requireQuestionService(path: string): string {
  const base = questionServiceBase ?? gatewayBase
  if (!base || base.length === 0) {
    throw new Error("Question service URL is not configured")
  }
  return `${base}${path}`
}

export interface AdminAttempt extends Attempt {
  userName: string
}

export async function getUserAttempts(userId: string): Promise<Attempt[]> {
  const response = await fetch(resolveHistoryUrl(`/users/${userId}/attempts`, `/history/user/${userId}`), {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user attempts")
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

export async function createPendingAttempt(attemptData: {
  userId: any;
  questionId: string;
  question: MatchQuestion
}): Promise<Attempt> {
  const safeQuestion = JSON.parse(JSON.stringify(attemptData.question));
  const payload = {
    userId: attemptData.userId,
    questionId: attemptData.questionId,
    attemptedAt: new Date().toISOString(),
    questionJson: safeQuestion,
  }

  const response = await fetch(requireQuestionService("/history"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to create pending attempt")
  }

  return response.json()
}

// Update attempt code, duration
export async function updateAttempt(
  attemptId: string,
  updateData: Partial<{
    code: string
    output: string
    status: "COMPLETED"
    questionId: string
  }>,
): Promise<Attempt> {
  const response = await fetch(requireQuestionService(`/history/${attemptId}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(updateData),
  })

  if (!response.ok) {
    throw new Error("Failed to update attempt")
  }

  return response.json()
}

export async function getAllAttempts(): Promise<AdminAttempt[]> {
  const base = gatewayBase ?? questionServiceBase
  if (!base || base.length === 0) {
    throw new Error("History service URL is not configured")
  }

  const response = await fetch(`${base}/admin/attempts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch all attempts")
  }

  return response.json()
}
