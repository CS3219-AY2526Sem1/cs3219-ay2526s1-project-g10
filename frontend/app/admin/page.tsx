import Link from "next/link"
import { Users, FileQuestion, BarChart3, Settings } from "lucide-react"
import { getAdminStats } from "../../services/admin"

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-200 border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-2xl font-bold text-gray-900">
            PeerPrep Admin
          </Link>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Questions</h3>
              <FileQuestion className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalQuestions}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Attempts</h3>
              <Settings className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/user"
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <Users className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600">View, edit, and manage user accounts</p>
          </Link>

          <Link
            href="/admin/question"
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <FileQuestion className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Questions</h3>
            <p className="text-sm text-gray-600">Add, edit, and organize questions</p>
          </Link>

          <Link
            href="/admin/history"
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <BarChart3 className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View All Attempts</h3>
            <p className="text-sm text-gray-600">Monitor user attempt history</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
