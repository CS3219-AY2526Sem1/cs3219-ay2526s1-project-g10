"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Edit, Trash2, Plus } from "lucide-react"
import { getQuestions, deleteQuestion as deleteQuestionService, type Question } from "../../../services/question"

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getQuestions({ search: searchQuery })
        setQuestions(data)
      } catch (error) {
        console.error("Error fetching questions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchQuery])

  const handleDelete = async (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestionService(questionId)
        setQuestions(questions.filter((q) => q.id !== questionId))
      } catch (error) {
        console.error("Error deleting question:", error)
        alert("Failed to delete question")
      }
    }
  }

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
      <header className="bg-blue-200 border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left side: logo + navigation */}
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-2xl font-bold text-gray-900">
              PeerPrep Admin
            </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4">
            <Link
              href="/admin/question"
              className="flex items-center gap-2 rounded-full bg-blue-300 px-5 py-2 text-sm font-medium text-gray-900 hover:bg-blue-400 transition-colors"
            >
              Manage Questions
            </Link>
            <Link
              href="/admin/user"
              className="flex items-center gap-2 rounded-full bg-blue-400 px-5 py-2 text-sm font-medium text-gray-900 hover:bg-blue-400 transition-colors"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/history"
              className="flex items-center gap-2 rounded-full bg-blue-300 px-5 py-2 text-sm font-medium text-gray-900 hover:bg-blue-500 transition-colors"
            >
              View History
            </Link>
          </nav>
        </div>

        {/* Right side: profile button */}
          <Link
            href="/user/profile"
            className="w-12 h-12 rounded-full bg-blue-300 border-2 border-blue-400 flex items-center justify-center hover:bg-blue-400 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
          <button className="bg-blue-400 hover:bg-blue-500 text-gray-900 font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-400 bg-white"
          />
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Difficulty</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Topics</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Loading questions...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No questions found
                  </td>
                </tr>
              ) : (
                questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{question.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                      >
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {question.topics.map((topic: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
