// Real question service
export interface Question {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  topics: string[]
  description: string
}

export async function getQuestions(filters?: {
  difficulty?: string
  search?: string
}): Promise<Question[]> {
  const params = new URLSearchParams()
  if (filters?.difficulty && filters.difficulty !== "all") {
    params.append("difficulty", filters.difficulty)
  }
  if (filters?.search) {
    params.append("search", filters.search)
  }

  const response = await fetch(`/api/questions?${params}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch questions")
  }

  return response.json()
}

export async function getQuestion(id: string): Promise<Question | null> {
  const response = await fetch(`/api/questions/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch question")
  }

  return response.json()
}

export async function createQuestion(question: Omit<Question, "id">): Promise<Question> {
  const response = await fetch("/api/questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(question),
  })

  if (!response.ok) {
    throw new Error("Failed to create question")
  }

  return response.json()
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
  const response = await fetch(`/api/questions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error("Failed to update question")
  }

  return response.json()
}

export async function deleteQuestion(id: string): Promise<void> {
  const response = await fetch(`/api/questions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete question")
  }
}
