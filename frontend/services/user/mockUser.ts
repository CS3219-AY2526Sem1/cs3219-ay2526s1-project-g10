// Mock user service
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

export interface Attempt {
  id: string
  questionTitle: string
  difficulty: "Easy" | "Medium" | "Hard"
  status: "Completed" | "In Progress" | "Failed"
  score: number
  date: string
  duration: string
}

const MOCK_PROFILE: UserProfile = {
  id: "1",
  name: "John Doe",
  email: "user@example.com",
  role: "user",
  joinedDate: "2024-01-15",
  questionsCompleted: 47,
  currentStreak: 5,
  longestStreak: 12,
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return MOCK_PROFILE
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { ...MOCK_PROFILE, ...updates }
}
