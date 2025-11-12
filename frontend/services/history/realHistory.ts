// Real history service
export interface Attempt {
  id: string
  questionTitle: string
  difficulty: "Easy" | "Medium" | "Hard"
  status: "Completed" | "In Progress" | "Failed"
  score: number
  date: string
  duration: string
}

export interface AdminAttempt extends Attempt {
  userName: string
  userId: string
}

export async function getUserAttempts(userId: string): Promise<Attempt[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/users/${userId}/attempts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user attempts")
  }

  return response.json()
}

export async function getAllAttempts(): Promise<AdminAttempt[]> {
  const response = await fetch("${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/admin/attempts", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch all attempts")
  }

  return response.json()
}
