"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Edit, Trash2, UserPlus } from "lucide-react"
import { getAllUsers, deleteUser as deleteUserService, type AdminUser } from "../../../services/admin"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllUsers(searchQuery)
        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchQuery])

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserService(userId)
        setUsers(users.filter((u) => u.id !== userId))
      } catch (error) {
        console.error("Error deleting user:", error)
        alert("Failed to delete user")
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <button className="bg-blue-400 hover:bg-blue-500 text-gray-900 font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition-colors">
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-400 bg-white"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Questions</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.joinedDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.questionsCompleted}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
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
