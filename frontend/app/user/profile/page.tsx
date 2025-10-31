"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, User, Folder, Clock, Edit2, LogOut, Check, X } from "lucide-react"
import { getUserProfile, type UserProfile } from "../../../services/user"
import { useAuth } from "../../../contexts/auth-context"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<"username" | "email" | null>(null)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      console.log("=== PROFILE PAGE START ===")
          console.log("1. User object from auth context:", user)
          console.log("2. User ID:", user.id)
          console.log("3. User email from auth context:", user.email)

      try {
        const data = await getUserProfile(user.id)
        console.log("5. getUserProfile returned:", data)
        console.log("6. data.email:", data.email)
        setProfile(data)
        setUsername(data.username)
        setEmail(data.email)
        console.log("7. State set - email:", data.email)
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

  const handleSaveUsername = async () => {
    if (!user || !username.trim()) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase
        .from("users")
        .update({ username: username.trim() })
        .eq("id", user.id)

      if (error) throw error

      setProfile((prev) => prev && { ...prev, username: username.trim() })
      setEditingField(null)
      setMessage({ type: "success", text: "Username updated successfully!" })
    } catch (err: any) {
      console.error("Failed to update username:", err.message)
      setMessage({ type: "error", text: "Failed to update username. Please try again." })
    } finally {
      setSaving(false)
    }
  }

//   const handleSaveEmail = async () => {
//     if (!user || !email.trim()) return
//
//     setSaving(true)
//     setMessage(null)
//
//     try {
//       const supabase = createClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//       )
//
//       const { error: authError } = await supabase.auth.updateUser(
//         { email: email.trim() },
//         { emailRedirectTo: 'http://localhost:3000/auth/callback' }
//       )
//
//       if (authError) throw authError
//
//       await signOut()
//       router.push("/user/verify-email?email=" + encodeURIComponent(email.trim()))
//     } catch (err: any) {
//       console.error("Failed to update email:", err.message)
//       setMessage({ type: "error", text: err.message || "Failed to update email. Please try again." })
//       setEmail(profile?.email || "")
//       setSaving(false)
//     }
//   }

//   const handleSaveEmail = async () => {
//     if (!user || !email.trim()) return
//
//     setSaving(true)
//     setMessage(null)
//
//     try {
//       const supabase = createClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//       )
//
//       const { error: authError } = await supabase.auth.updateUser(
//         { email: email.trim() },
//         {
//           emailRedirectTo: `${window.location.origin}/auth/callback?type=email_change`
//         }
//       )
//
//       if (authError) throw authError
//
//       await signOut()
//       router.push("/user/verify-email?email=" + encodeURIComponent(email.trim()))
//     } catch (err: any) {
//       console.error("Failed to update email:", err.message)
//       setMessage({ type: "error", text: err.message || "Failed to update email. Please try again." })
//       setEmail(profile?.email || "")
//       setSaving(false)
//     }
//   }

  const handleSaveEmail = async () => {
    if (!user || !email.trim()) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error: authError } = await supabase.auth.updateUser(
        { email: email.trim() },
        { emailRedirectTo: `${window.location.origin}/auth/callback?type=email_change` }
      )
      if (authError) throw authError

      const { error: tableError } = await supabase
        .from("users")
        .update({ email: email.trim() })
        .eq("id", user.id)
      if (tableError) throw tableError

      await signOut()

      router.push("/user/verify-email?email=" + encodeURIComponent(email.trim()))
    } catch (err: any) {
      console.error("Failed to update email:", err.message)
      setMessage({ type: "error", text: err.message || "Failed to update email. Please try again." })
      setEmail(profile?.email || "")
      setSaving(false)
    }
  }


  const handleCancel = () => {
    setEditingField(null)
    setUsername(profile?.username || "")
    setEmail(profile?.email || "")
    setMessage(null)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Profile Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-900 bg-blue-200 mb-4">
                <User className="h-12 w-12 text-gray-900" />
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {profile.isAdmin ? "Admin" : "User"}
              </span>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {message.text}
              </div>
            )}

            {/* Username Field */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Username</span>
                {editingField !== "username" && (
                  <button
                    onClick={() => setEditingField("username")}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    disabled={editingField !== null}
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              {editingField === "username" ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={saving}
                  />
                  <button
                    onClick={handleSaveUsername}
                    disabled={saving || !username.trim()}
                    className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="p-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-gray-900">{profile.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Email</span>
                {editingField !== "email" && (
                  <button
                    onClick={() => setEditingField("email")}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    disabled={editingField !== null}
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              {editingField === "email" ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={saving}
                    />
                    <button
                      onClick={handleSaveEmail}
                      disabled={saving || !email.trim()}
                      className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="p-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    A verification link will be sent to your new email address
                  </p>
                </div>
              ) : (
                <p className="text-gray-900">{profile.email}</p>
              )}
            </div>

            {/* Joined Date */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">Joined:</span> {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Logout Button */}
            <div className="space-y-2">
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
      </div>
    </div>
  )
}