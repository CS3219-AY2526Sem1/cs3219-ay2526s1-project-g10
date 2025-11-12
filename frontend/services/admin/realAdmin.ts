// Real admin service
export interface AdminUser {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  joinedDate: string
  questionsCompleted: number
}

export interface AdminStats {
  totalUsers: number
  totalQuestions: number
  totalAttempts: number
  activeUsers: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch("${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/admin/stats", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch admin stats")
  }

  return response.json()
}

export async function getAllUsers(search?: string): Promise<AdminUser[]> {
  const params = new URLSearchParams()
  if (search) params.append("search", search)

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/admin/users?${params}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }

  return response.json()
}

export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete user")
  }
}

export async function updateUserRole(userId: string, role: "user" | "admin"): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify({ role }),
  })

  if (!response.ok) {
    throw new Error("Failed to update user role")
  }
}
