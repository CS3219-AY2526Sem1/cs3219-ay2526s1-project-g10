// Mock authentication service
export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
}

export interface AuthResponse {
  user: User
  token: string
}

const MOCK_USERS: User[] = [
  { id: "1", email: "admin@example.com", name: "Admin User", role: "admin" },
  { id: "2", email: "user@example.com", name: "John Doe", role: "user" },
]

export async function login(email: string, password: string): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = MOCK_USERS.find((u) => u.email === email)
  if (!user || password !== "password123") {
    throw new Error("Invalid email or password")
  }

  return {
    user,
    token: `mock-token-${user.id}`,
  }
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (MOCK_USERS.find((u) => u.email === email)) {
    throw new Error("Email already exists")
  }

  const newUser: User = {
    id: `${Date.now()}`,
    email,
    name,
    role: "user",
  }

  return {
    user: newUser,
    token: `mock-token-${newUser.id}`,
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = MOCK_USERS.find((u) => u.email === email)
  if (!user) {
    throw new Error("Email not found")
  }
}

export async function getCurrentUser(): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const userStr = localStorage.getItem("mock_user")
  if (!userStr) return null

  return JSON.parse(userStr)
}

export async function logout(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  localStorage.removeItem("mock_user")
  localStorage.removeItem("mock_token")
}
