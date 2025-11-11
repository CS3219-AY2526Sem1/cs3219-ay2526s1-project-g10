// Mock history service
export interface Attempt {
  questionId: string
  id: string
  questionTitle: string
  difficulty: "Easy" | "Medium" | "Hard"
  status: "Completed" | "In Progress" | "Failed"
  score: number
  date: string
  duration: string
}

export interface AdminAttempt extends Attempt {
  userName: string
  userId: string
}

const MOCK_USER_ATTEMPTS: Attempt[] = [
  {
    id: "1",
    questionTitle: "Two Sum",
    difficulty: "Easy",
    status: "Completed",
    score: 95,
    date: "2024-03-15",
    duration: "15 mins",
    questionId: ""
  },
  {
    id: "2",
    questionTitle: "Reverse Linked List",
    difficulty: "Medium",
    status: "Completed",
    score: 88,
    date: "2024-03-14",
    duration: "25 mins",
    questionId: ""
  },
  {
    id: "3",
    questionTitle: "Binary Tree Traversal",
    difficulty: "Medium",
    status: "In Progress",
    score: 0,
    date: "2024-03-16",
    duration: "10 mins",
  },
]

const MOCK_ALL_ATTEMPTS: AdminAttempt[] = [
  {
    id: "1",
    userId: "1",
    userName: "John Doe",
    questionTitle: "Two Sum",
    difficulty: "Easy",
    status: "Completed",
    score: 95,
    date: "2024-03-15",
    duration: "15 mins",
  },
  {
    id: "2",
    userId: "2",
    userName: "Jane Smith",
    questionTitle: "Reverse Linked List",
    difficulty: "Medium",
    status: "Completed",
    score: 88,
    date: "2024-03-14",
    duration: "25 mins",
  },
  {
    id: "3",
    userId: "1",
    userName: "John Doe",
    questionTitle: "Binary Tree Traversal",
    difficulty: "Medium",
    status: "In Progress",
    score: 0,
    date: "2024-03-16",
    duration: "10 mins",
  },
]

export async function getUserAttempts(userId: string): Promise<Attempt[]> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return MOCK_USER_ATTEMPTS
}

export async function getAllAttempts(): Promise<AdminAttempt[]> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return MOCK_ALL_ATTEMPTS
}
