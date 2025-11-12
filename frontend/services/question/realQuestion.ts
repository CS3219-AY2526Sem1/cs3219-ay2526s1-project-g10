// Real question service
export interface Question {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  topics: string[]
  description: string
  language?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL

console.log("API_URL =", API_URL);

function mapDifficulty(difficulty: string): "Easy" | "Medium" | "Hard" {
  const map: Record<string, "Easy" | "Medium" | "Hard"> = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
  }
  return map[difficulty]
}

function transformQuestion(q: any): Question {
  return {
    id: String(q.id),
    title: q.title,
    difficulty: mapDifficulty(q.difficulty),
    topics: q.topic ? [q.topic] : [],
    description: q.description,
    language: q.language,
  }
}

export async function getQuestions(page = 1, limit = 100): Promise<{
  questions: Question[]
  totalCount: number
  totalPages: number
  currentPage: number
}> {
  try {
    const token = localStorage.getItem("auth_token")
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/questions?${params}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch questions")
    }

    const data = await response.json()

    const questions = data.questions.map(transformQuestion)

    return {
      questions,
      totalCount: data.totalCount,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
    }
  } catch (error) {
    console.error("Error fetching questions:", error)
    throw error
  }
}

// export async function getQuestions(filters?: {
//   difficulty?: string
//   search?: string
// }): Promise<Question[]> {
//   try {
//     const params = new URLSearchParams()
//
//     const token = localStorage.getItem("auth_token")
//
//     const response = await fetch(`${API_URL}/questions${params.toString() ? `?${params}` : ""}`, {
//       headers: {
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//     })
//
//     if (!response.ok) {
//       throw new Error("Failed to fetch questions")
//     }
//
//     const data = await response.json()
//
//     let questions = Array.isArray(data) ? data : [data]
//
//     questions = questions.map(transformQuestion)
//
//     if (filters?.search) {
//       const searchLower = filters.search.toLowerCase()
//       questions = questions.filter((q) =>
//         q.title.toLowerCase().includes(searchLower) ||
//         q.description.toLowerCase().includes(searchLower) ||
//         q.topics.some(t => t.toLowerCase().includes(searchLower))
//       )
//     }
//
//     return questions
//   } catch (error) {
//     console.error("Error fetching questions:", error)
//     throw error
//   }
// }

// export async function getQuestion(id: string): Promise<Question | null> {
//   try {
//     const questions = await getQuestions()
//     const question = questions.find(q => q.id === id)
//     return question || null
//   } catch (error) {
//     console.error("Error fetching question:", error)
//     throw error
//   }
// }

