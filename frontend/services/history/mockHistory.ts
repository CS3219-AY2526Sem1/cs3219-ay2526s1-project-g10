// Mock history service
import type { Attempt as RealAttempt, AdminAttempt as RealAdminAttempt } from "./realHistory"

export type Attempt = RealAttempt
export type AdminAttempt = RealAdminAttempt

const MOCK_USER_ATTEMPTS: Attempt[] = [
  {
    id: 1,
    userId: "1",
    questionId: 101,
    attemptedAt: "2024-03-15T10:30:00.000Z",
    status: "COMPLETED",
    questionTitle: "Two Sum",
    difficulty: "Easy",
    code: "function twoSum() { /* ... */ }",
    output: "[0,1]",
  },
  {
    id: 2,
    userId: "1",
    questionId: 202,
    attemptedAt: "2024-03-14T14:05:00.000Z",
    status: "COMPLETED",
    questionTitle: "Reverse Linked List",
    difficulty: "Medium",
    code: "function reverseList() { /* ... */ }",
    output: "1 -> 3 -> 2",
  },
  {
    id: 3,
    userId: "1",
    questionId: null,
    attemptedAt: "2024-03-16T08:12:00.000Z",
    status: "PENDING",
    questionTitle: "Binary Tree Traversal",
    difficulty: "Medium",
    code: "",
    output: "",
  },
]

const MOCK_ALL_ATTEMPTS: AdminAttempt[] = [
  {
    id: 4,
    userId: "2",
    questionId: 303,
    attemptedAt: "2024-03-12T09:00:00.000Z",
    status: "COMPLETED",
    questionTitle: "Merge Intervals",
    difficulty: "Medium",
    userName: "Jane Smith",
  },
  {
    id: 5,
    userId: "3",
    questionId: 404,
    attemptedAt: "2024-03-11T16:45:00.000Z",
    status: "COMPLETED",
    questionTitle: "LRU Cache",
    difficulty: "Hard",
    userName: "Alex Johnson",
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
