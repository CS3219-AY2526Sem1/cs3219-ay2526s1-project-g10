import { isAxiosError } from "axios"

import { userClient } from "../../network/axiosClient"
import { UserProfile } from "./types"

export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const response = await userClient.get<{ message?: string; data?: any }>(`/users/${userId}`)
    const payload = response.data?.data
    if (!payload) {
      throw new Error(response.data?.message ?? "Failed to fetch user profile")
    }
    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      isAdmin: Boolean(payload.isAdmin),
      createdAt: payload.createdAt,
    }
  } catch (error) {
    if (isAxiosError(error)) {
      const message = (error.response?.data as { message?: string } | undefined)?.message
        ?? error.message
        ?? "Failed to fetch user profile"
      throw new Error(message)
    }
    throw error
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
): Promise<UserProfile> {
  try {
    const response = await userClient.patch<{ message?: string; data?: any }>(`/users/${userId}`, updates)
    const payload = response.data?.data
    if (!payload) {
      throw new Error(response.data?.message ?? "Failed to update user profile")
    }
    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      isAdmin: Boolean(payload.isAdmin),
      createdAt: payload.createdAt,
    }
  } catch (error) {
    if (isAxiosError(error)) {
      const message = (error.response?.data as { message?: string } | undefined)?.message
        ?? error.message
        ?? "Failed to update user profile"
      throw new Error(message)
    }
    throw error
  }
}