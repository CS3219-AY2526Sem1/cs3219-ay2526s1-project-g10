// Real history service
import { MatchQuestion } from "../matching";

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

const QUESTION_SERVICE_URL = process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL?.replace(/\/$/, "")
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL?.replace(/\/$/, "")

function resolveHistoryUrl(gatewayPath: string, questionServicePath: string): string {
  if (API_GATEWAY_URL && API_GATEWAY_URL.length > 0) {
    return `${API_GATEWAY_URL}${gatewayPath}`
  }
  if (QUESTION_SERVICE_URL && QUESTION_SERVICE_URL.length > 0) {
    return `${QUESTION_SERVICE_URL}${questionServicePath}`
  }
  throw new Error("History service URL is not configured")
}

function requireQuestionService(path: string): string {
  if (!QUESTION_SERVICE_URL || QUESTION_SERVICE_URL.length === 0) {
    throw new Error("Question service URL is not configured")
  }
  return `${QUESTION_SERVICE_URL}${path}`
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
  if (!API_GATEWAY_URL || API_GATEWAY_URL.length === 0) {
    throw new Error("NEXT_PUBLIC_API_GATEWAY_URL must be set to fetch admin attempts")
  }

  const response = await fetch(`${API_GATEWAY_URL}/admin/attempts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch all attempts")
  }

  return response.json()
}
