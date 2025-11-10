"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "../../components/navigation/AppHeader"
import { createCustomRoom, joinCustomRoom } from "../../services/matching"
import { Users, Lock, Plus, LogIn } from "lucide-react"

type ViewMode = "select" | "create" | "join"

export default function CustomRoomPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("select")

  // Create room state
  const [roomName, setRoomName] = useState("")
  const [difficulty, setDifficulty] = useState<string>("")
  const [topic, setTopic] = useState<string>("")
  const [password, setPassword] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Join room state
  const [roomCode, setRoomCode] = useState("")
  const [joinPassword, setJoinPassword] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Room created state
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null)

  const difficulties = ["Easy", "Medium", "Hard"]
  const topics = [
    "Shell", "Queue", "Dynamic Programming", "Algorithms", "Linked List",
    "Hash Table", "Math", "Others", "String", "Database", "Array",
    "Tree", "Graph", "Concurrency", "Stack",
  ]

  const handleCreateRoom = async () => {
    if (!difficulty || !topic || !password) {
      setCreateError("Please fill in all fields")
      return
    }

    if (password.length < 4) {
      setCreateError("Password must be at least 4 characters")
      return
    }

    setIsCreating(true)
    setCreateError(null)

    try {
      const response = await createCustomRoom({
        difficulty,
        topic,
        password,
        roomName: roomName || undefined,
      })

      setCreatedRoomCode(response.roomCode)
      // Redirect to collaboration after showing room code
      setTimeout(() => {
        router.push(`/collaboration?roomId=${encodeURIComponent(response.roomId)}`)
      }, 3000)
    } catch (error) {
      console.error("Failed to create room:", error)
      setCreateError(error instanceof Error ? error.message : "Failed to create room")
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!roomCode || !joinPassword) {
      setJoinError("Please enter room code and password")
      return
    }

    setIsJoining(true)
    setJoinError(null)

    try {
      const response = await joinCustomRoom({
        roomCode: roomCode.toUpperCase(),
        password: joinPassword,
      })

      router.push(`/collaboration?roomId=${encodeURIComponent(response.roomId)}`)
    } catch (error) {
      console.error("Failed to join room:", error)
      setJoinError(error instanceof Error ? error.message : "Failed to join room")
    } finally {
      setIsJoining(false)
    }
  }

  if (createdRoomCode) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <AppHeader />
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-3xl bg-white dark:bg-gray-800 p-8 text-center shadow-sm transition-colors">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Users className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">Room Created!</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">Share this code with your friends:</p>
            <div className="mb-8 rounded-2xl bg-blue-50 dark:bg-blue-950 p-6">
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Room Code</p>
              <p className="text-4xl font-bold tracking-wider text-blue-600 dark:text-blue-400">{createdRoomCode}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to collaboration room...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <AppHeader />

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push("/matching")}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            ← Back to Matching
          </button>
        </div>

        {viewMode === "select" && (
          <div>
            <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">Custom Room</h1>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Create Room Card */}
              <button
                onClick={() => setViewMode("create")}
                className="group rounded-3xl bg-white dark:bg-gray-800 p-8 text-left shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 transition-colors group-hover:bg-blue-200 dark:group-hover:bg-blue-900">
                  <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Create Room</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Start a new collaboration room with custom settings. Share the room code with friends.
                </p>
              </button>

              {/* Join Room Card */}
              <button
                onClick={() => setViewMode("join")}
                className="group rounded-3xl bg-white dark:bg-gray-800 p-8 text-left shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 transition-colors group-hover:bg-green-200 dark:group-hover:bg-green-800">
                  <LogIn className="w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Join Room</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter a room code and password to join an existing collaboration session.
                </p>
              </button>
            </div>
          </div>
        )}

        {viewMode === "create" && (
          <div>
            <button
              onClick={() => setViewMode("select")}
              className="mb-6 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back
            </button>

            <div className="rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-sm transition-colors">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Create Custom Room</h2>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Difficulty *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {difficulties.map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`rounded-xl border-2 px-4 py-3 font-medium transition-colors ${
                          difficulty === diff
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Topic *
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select a topic</option>
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Room Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-3 pl-12 pr-4 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Share this password with friends to let them join
                  </p>
                </div>

                {createError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-900 p-4 text-sm text-red-700 dark:text-red-200 transition-colors">
                    {createError}
                  </div>
                )}

                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating || !difficulty || !topic || !password}
                  className={`w-full rounded-full px-6 py-4 font-semibold text-white transition-colors ${
                    isCreating || !difficulty || !topic || !password
                      ? "cursor-not-allowed bg-gray-300 dark:bg-gray-700"
                      : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  }`}
                >
                  {isCreating ? "Creating Room..." : "Create Room"}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === "join" && (
          <div>
            <button
              onClick={() => setViewMode("select")}
              className="mb-6 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back
            </button>

            <div className="rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-sm transition-colors">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Join Custom Room</h2>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Room Code *
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="ABCD1234"
                    maxLength={8}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 font-mono text-lg uppercase tracking-wider focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Room Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      placeholder="Enter room password"
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-3 pl-12 pr-4 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {joinError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-900 p-4 text-sm text-red-700 dark:text-red-200 transition-colors">
                    {joinError}
                  </div>
                )}

                <button
                  onClick={handleJoinRoom}
                  disabled={isJoining || !roomCode || !joinPassword}
                  className={`w-full rounded-full px-6 py-4 font-semibold text-white transition-colors ${
                    isJoining || !roomCode || !joinPassword
                      ? "cursor-not-allowed bg-gray-300 dark:bg-gray-700"
                      : "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                  }`}
                >
                  {isJoining ? "Joining Room..." : "Join Room"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}