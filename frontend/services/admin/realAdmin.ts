import { getRuntimeEnv, resolveGatewayBase, stripTrailingSlash } from "../../lib/runtimeEnv"

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

function getAuthToken(): string {
  if (typeof window === "undefined") {
    throw new Error("Authentication token is not available in this environment.")
  }

  const token = window.localStorage.getItem("auth_token")

  if (!token) {
    throw new Error("Authentication token missing. Please sign in again.")
  }

  return token
}

function buildAuthHeaders(additional?: Record<string, string>): Record<string, string> {
  const token = getAuthToken()

  return {
    Authorization: `Bearer ${token}`,
    ...(additional ?? {}),
  }
}

const gatewayEnv = getRuntimeEnv("NEXT_PUBLIC_API_GATEWAY_URL")
const apiGatewayBase = gatewayEnv ? stripTrailingSlash(gatewayEnv) : undefined

function buildUrl(path: string): string {
  if (apiGatewayBase && apiGatewayBase.length > 0) {
    return `${apiGatewayBase}${path}`
  }
  if (process.env.NODE_ENV === "development") {
    return `/api${path}`
  }
  return `${stripTrailingSlash(resolveGatewayBase())}${path}`
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch(buildUrl("/admin/stats"), {
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch admin stats")
  }

  return response.json()
}

export async function getAllUsers(search?: string): Promise<AdminUser[]> {
  const params = new URLSearchParams()
  if (search) params.append("search", search)

  const response = await fetch(`${buildUrl("/admin/users")}?${params}`, {
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }

  return response.json()
}

export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(buildUrl(`/admin/users/${userId}`), {
    method: "DELETE",
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to delete user")
  }
}

export async function updateUserRole(userId: string, role: "user" | "admin"): Promise<void> {
  const response = await fetch(buildUrl(`/admin/users/${userId}/role`), {
    method: "PATCH",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ role }),
  })

  if (!response.ok) {
    throw new Error("Failed to update user role")
  }
}
