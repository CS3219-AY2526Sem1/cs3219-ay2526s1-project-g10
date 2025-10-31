// Mock question service
export interface Question {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  topics: string[]
  description: string
  language?: string
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Table"],
    description: "Given an array of integers, return indices of the two numbers that add up to a specific target.",
    language: "python",
  },
  {
    id: "2",
    title: "Reverse Linked List",
    difficulty: "Medium",
    topics: ["Linked Lists"],
    description: "Reverse a singly linked list.",
    language: "python",
    },
  {
    id: "3",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    topics: ["Trees", "Dynamic Programming"],
    description: "Find the maximum path sum in a binary tree.",
    language: "python",
  },
]

export async function getQuestions(filters?: {
  difficulty?: string
  search?: string
}): Promise<Question[]> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  let filtered = [...MOCK_QUESTIONS]

  if (filters?.difficulty && filters.difficulty !== "all") {
    filtered = filtered.filter((q) => q.difficulty === filters.difficulty)
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      (q) => q.title.toLowerCase().includes(search) || q.description.toLowerCase().includes(search),
    )
  }

  return filtered
}

export async function getQuestion(id: string): Promise<Question | null> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return MOCK_QUESTIONS.find((q) => q.id === id) || null
}

export async function createQuestion(question: Omit<Question, "id">): Promise<Question> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    id: `${Date.now()}`,
    ...question,
  }
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const question = MOCK_QUESTIONS.find((q) => q.id === id)
  if (!question) throw new Error("Question not found")
  return { ...question, ...updates }
}

export async function deleteQuestion(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
}
