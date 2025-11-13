"use client"

import { useState, useEffect } from "react"
import { getQuestions, type Question } from "../../services/question"
import { AppHeader } from "../../components/navigation/AppHeader"

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
        const difficultyFilter = selectedDifficulty !== "all" ? selectedDifficulty : undefined
        const data = await getQuestions({
          page: currentPage,
          limit: 50,
          search: searchQuery || undefined,
          difficulty: difficultyFilter,
        })
        setQuestions(data.questions)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error("Error fetching questions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentPage, searchQuery, selectedDifficulty])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <AppHeader />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Questions</h1>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-12 text-center shadow-sm transition-colors">
            <p className="text-gray-600 dark:text-gray-300">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-12 text-center shadow-sm transition-colors">
            <p className="text-gray-600 dark:text-gray-300">No questions found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{question.title}</h3>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                        >
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{question.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const topics = question.topic
                            ? question.topic.split(/\s*,\s*/).filter((topic) => topic.length > 0)
                            : []

                          if (!topics.length) {
                            return (
                              <span className="inline-flex px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                {question.language ?? "General"}
                              </span>
                            )
                          }

                          return topics.map((topic, idx) => (
                            <span
                              key={`${question.id}-${topic}-${idx}`}
                              className="inline-flex px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                            >
                              {topic}
                              {question.language ? ` • ${question.language}` : ""}
                            </span>
                          ))
                        })()}
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
                className="px-4 py-2 rounded-full bg-blue-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-gray-100 transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-700 dark:text-gray-200 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 rounded-full bg-blue-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-gray-100 transition-colors"
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
