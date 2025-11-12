// Real history service
import {MatchQuestion} from "../matching";

export interface Attempt {
  id: string
  questionTitle: string
  questionId: string
  questionJson?: MatchQuestion
  difficulty: "Easy" | "Medium" | "Hard"
  status: "Completed" | "PENDING"
  score: number
  date: string
  duration: string
}

const API_URL = process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL

export interface AdminAttempt extends Attempt {
  userName: string
  userId: string
}

export async function getUserAttempts(userId: string): Promise<Attempt[]> {
  const response = await fetch(`${API_URL}/history/user/${userId}`, {
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
    solution: "",
    actions: {},
    attemptedAt: new Date().toISOString(),
    questionJson: safeQuestion
  }

  console.log("Creating pending attempt with payload:", payload);

  const response = await fetch(`${API_URL}/history`, {
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

// Update attempt
export async function updateAttemptDuration(attemptId: string, duration: string): Promise<Attempt> {
  const response = await fetch(`${API_URL}/history/${attemptId}/duration`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify({ duration }),
  })

  if (!response.ok) {
    throw new Error("Failed to update attempt duration")
  }

  return response.json()
}

// Update attempt code, duration
export async function updateAttempt( attemptId: string, updateData: Partial<
{ code: string,
  duration: string,
  output: string,
  status: "COMPLETED",
  questionId: string
}>
): Promise<Attempt> {
  const response = await fetch(`${API_URL}/history/${attemptId}`, {
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
  const response = await fetch("/api/admin/attempts", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch all attempts")
  }

  return response.json()
}
