// Mock auth service
export interface User {
  id: string
  email: string
  username: string
  isAdmin: boolean
  createdAt?: string
  emailConfirmedAt?: string | null
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

const MOCK_USERS: User[] = [
  { id: "1", email: "admin@example.com", username: "Admin User", isAdmin: true, emailConfirmedAt: new Date().toISOString() },
  { id: "2", email: "user@example.com", username: "John Doe", isAdmin: false, emailConfirmedAt: new Date().toISOString() },
]

const MOCK_ADMIN_CODE = "ADMIN"

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

export async function signup(username: string, email: string, password: string, adminCode?: string): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (MOCK_USERS.find((u) => u.email === email)) {
    throw new Error("Email already exists")
  }

  const newUser: User = {
    id: `${Date.now()}`,
    email,
    username,
    isAdmin: adminCode?.trim() === MOCK_ADMIN_CODE,
    emailConfirmedAt: null,
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

  const userStr = localStorage.getItem("user") ?? localStorage.getItem("mock_user")
  if (!userStr) return null

  return JSON.parse(userStr) as User
}

export async function logout(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  localStorage.removeItem("mock_user")
  localStorage.removeItem("mock_token")
}
