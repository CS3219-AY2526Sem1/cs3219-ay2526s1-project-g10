"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, User, Folder, Clock } from "lucide-react"
import { getQuestions, type Question } from "../../services/question"

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getQuestions(currentPage, 50)
        setQuestions(data.questions)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error("Error fetching questions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentPage])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/main" className="text-2xl font-bold text-gray-900 hover:opacity-80 transition-opacity">
              Peer
              <br />
              Prep
            </Link>

            <nav className="flex items-center gap-4">
              <Link
                href="/matching"
                className="flex items-center gap-2 rounded-full bg-blue-200 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-300"
              >
                <User className="h-4 w-4" />
                Match
              </Link>
              <Link
                href="/question"
                className="flex items-center gap-2 rounded-full bg-blue-200 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-300"
              >
                <Folder className="h-4 w-4" />
                Questions
              </Link>
              <Link
                href="/history"
                className="flex items-center gap-2 rounded-full bg-blue-200 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-300"
              >
                <Clock className="h-4 w-4" />
                Attempt History
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/user/profile"
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-900 bg-blue-200 transition-colors hover:bg-blue-300"
            >
              <User className="h-6 w-6 text-gray-900" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-600">No questions found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{question.title}</h3>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                        >
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {question.topics.map((topic: string, idx: number) => (
                          <span key={idx} className="inline-flex px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                            {topic}{question.language ? ` • ${question.language}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2 rounded-full bg-blue-200 hover:bg-blue-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 rounded-full bg-blue-200 hover:bg-blue-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
