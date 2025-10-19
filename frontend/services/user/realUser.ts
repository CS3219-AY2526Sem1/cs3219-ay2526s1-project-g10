// Real user service
export interface UserProfile {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  joinedDate: string
  questionsCompleted: number
  currentStreak: number
  longestStreak: number
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user profile")
  }

  return response.json()
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error("Failed to update user profile")
  }

  return response.json()
}
