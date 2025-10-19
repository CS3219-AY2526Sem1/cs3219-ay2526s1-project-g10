// Mock admin service
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

const MOCK_USERS: AdminUser[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    joinedDate: "2024-01-15",
    questionsCompleted: 47,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    joinedDate: "2024-02-20",
    questionsCompleted: 32,
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    joinedDate: "2023-12-01",
    questionsCompleted: 150,
  },
]

export async function getAdminStats(): Promise<AdminStats> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return {
    totalUsers: 1234,
    totalQuestions: 456,
    totalAttempts: 8901,
    activeUsers: 342,
  }
}

export async function getAllUsers(search?: string): Promise<AdminUser[]> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  if (search) {
    const searchLower = search.toLowerCase()
    return MOCK_USERS.filter(
      (u) => u.name.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower),
    )
  }

  return MOCK_USERS
}

export async function deleteUser(userId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

export async function updateUserRole(userId: string, role: "user" | "admin"): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
}
