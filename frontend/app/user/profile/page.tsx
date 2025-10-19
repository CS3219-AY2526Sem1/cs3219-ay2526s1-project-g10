"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, User, Folder, Clock, Edit2, LogOut } from "lucide-react"
import { getUserProfile, type UserProfile } from "../../../services/user"
import { useAuth } from "../../../contexts/auth-context"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const data = await getUserProfile(user.id)
        setProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const handleLogout = async () => {
    await signOut()
    router.push("/user/login")
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/match" className="text-2xl font-bold text-gray-900 hover:opacity-80 transition-opacity">
              Peer
              <br />
              Prep
            </Link>

            <nav className="flex items-center gap-4">
              <Link
                href="/match"
                className="flex items-center gap-2 rounded-full bg-blue-200 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-300"
              >
                <User className="h-4 w-4" />
                Match
              </Link>
              <Link
                href="/questions"
                className="flex items-center gap-2 rounded-full bg-blue-200 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-300"
              >
                <Folder className="h-4 w-4" />
                Questions
              </Link>
              <Link
                href="/attempt-history"
                className="flex items-center gap-2 rounded-full bg-blue-200 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-300"
              >
                <Clock className="h-4 w-4" />
                Attempt History
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-blue-200 px-6 py-3">
              <Menu className="h-4 w-4 text-gray-700" />
              <input
                type="text"
                placeholder="Search"
                className="w-48 bg-transparent text-sm text-gray-900 placeholder-gray-600 outline-none"
              />
              <Search className="h-4 w-4 text-gray-700" />
            </div>
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
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-900 bg-blue-200 mb-4">
                  <User className="h-12 w-12 text-gray-900" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{profile.email}</p>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                  {profile.role}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Joined:</span> {profile.joinedDate}
                </p>
              </div>

              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 rounded-full bg-blue-300 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-400">
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-white border border-gray-300 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Questions Completed</h3>
                <p className="text-4xl font-bold text-gray-900">{profile.questionsCompleted}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Current Streak</h3>
                <p className="text-4xl font-bold text-gray-900">{profile.currentStreak}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Longest Streak</h3>
                <p className="text-4xl font-bold text-gray-900">{profile.longestStreak}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Member Since</h3>
                <p className="text-2xl font-bold text-gray-900">{profile.joinedDate}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed "Two Sum"</p>
                    <p className="text-xs text-gray-600">2 days ago</p>
                  </div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    100%
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Matched with Ryan</p>
                    <p className="text-xs text-gray-600">3 days ago</p>
                  </div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Match
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed "Reverse Linked List"</p>
                    <p className="text-xs text-gray-600">5 days ago</p>
                  </div>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    85%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
