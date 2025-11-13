"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Eye, ArrowLeft } from "lucide-react"
import { getAllAttempts } from "../../../services/history"

export default function AdminAttemptsPage() {
  const [attempts, setAttempts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllAttempts()
        setAttempts(data)
      } catch (error) {
        console.error("Error fetching attempts:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredAttempts = attempts.filter(
    (attempt) =>
      attempt.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.questionTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  const getStatusColor = (status: string) => {
    return status === "Completed" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-200 border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/main"
              className="flex items-center gap-2 rounded-full bg-blue-300 px-5 py-2 text-sm font-medium text-gray-900 hover:bg-blue-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to main
            </Link>
            <span className="text-2xl font-bold text-gray-900">Attempt History</span>
          </div>

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Attempt History</h1>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-400 bg-white"
          />
        </div>

        {/* Attempts Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Question</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Difficulty</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Score</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading attempts...
                  </td>
                </tr>
              ) : filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No attempts found
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{attempt.userName}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{attempt.questionTitle}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(attempt.difficulty)}`}
                      >
                        {attempt.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(attempt.status)}`}
                      >
                        {attempt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{attempt.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{attempt.score}%</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
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
