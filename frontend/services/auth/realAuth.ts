import { isAxiosError } from "axios"
import { userClient } from "../../network/axiosClient"

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

function mapUser(payload: any): User {
  if (!payload) {
    throw new Error("User payload missing")
  }

  return {
    id: payload.id,
    email: payload.email,
    username: payload.username,
    isAdmin: Boolean(payload.isAdmin),
    createdAt: payload.createdAt,
    emailConfirmedAt: payload.emailConfirmedAt ?? payload.email_confirmed_at ?? null,
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await userClient.post("/auth/login", { email, password })
  const payload = (response.data as {
    message?: string
    data?: { user?: any; accessToken?: string; refreshToken?: string }
  })?.data

  if (!payload?.user || !payload.accessToken) {
    throw new Error(response.data?.message ?? "Login failed")
  }

  const mappedUser = mapUser(payload.user)

  if (!mappedUser.emailConfirmedAt) {
    throw new Error("Please verify your email before logging in.")
  }

  return {
    user: mappedUser,
    token: payload.accessToken,
    refreshToken: payload.refreshToken,
  }
}

export async function signup(username: string, email: string, password: string): Promise<AuthResponse> {
  const response = await userClient.post("/auth/signup", { username, email, password })
  const payload = (response.data as { message?: string; data?: any }).data

  if (!payload) {
    throw new Error(response.data?.message ?? "Signup failed")
  }

  return {
    user: mapUser(payload),
    token: "",
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await userClient.post("/auth/forgot-password", { email })
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await userClient.get("/auth/me")
    const payload = (response.data as { message?: string; data?: any }).data
    if (!payload) {
      return null
    }
    return mapUser(payload)
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      return null
    }
    throw error
  }
}

export async function logout(): Promise<void> {
  try {
    await userClient.post("/auth/logout")
  } catch (error) {
    if (!(isAxiosError(error) && error.response?.status === 401)) {
      throw error
    }
  }
}