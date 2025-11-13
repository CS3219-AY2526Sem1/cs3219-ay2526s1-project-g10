// Mock user service
import { UserProfile } from "./types"

const MOCK_PROFILE: UserProfile = {
  id: "1",
  username: "John Doe",
  email: "user@example.com",
  isAdmin: false,
  createdAt: "2024-01-15T00:00:00.000Z",
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return MOCK_PROFILE
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { ...MOCK_PROFILE, ...updates }
}
