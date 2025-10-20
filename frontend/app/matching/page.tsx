"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, User, Folder, Clock } from "lucide-react"
import { findMatches, matchWithUser, type MatchResult, type MatchCriteria } from "../../services/matching"

export default function MatchPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isFindMatchDisabled = !selectedLanguage || !selectedDifficulty || !selectedTopic

  const languages = ["Java", "Python", "C"]
  const difficulties = ["Easy", "Medium", "Hard"]
  const topics = [
    "Arrays & Strings",
    "Linked Lists",
    "Stacks & Queues",
    "Hashing / Hash Maps",
    "Heaps & Priority Queues",
    "Sorting & Searching",
    "Recursion",
    "Greedy Algorithms",
    "Divide & Conquer",
    "Dynamic Programming",
    "Graphs",
  ]

  const toggleSelection = (item: string, selected: string[], setSelected: (items: string[]) => void) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item))
    } else {
      setSelected([...selected, item])
    }
  }

  const handleFindMatch = async () => {
    setIsLoading(true)
    try {
      const criteria: MatchCriteria = {
        languages: selectedLanguage,
        difficulties: selectedDifficulty,
        topics: selectedTopic,
      }
      const results = await findMatches(criteria)
      setMatchResults(results)
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMatchNow = async (userId: string) => {
    try {
      await matchWithUser(userId)
      alert(`Matched with user ${userId}!`)
    } catch (error) {
      console.error("Error matching with user:", error)
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          {/* Matching Criteria Sidebar */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Matching Criteria</h2>

            {/* Programming Language */}
            <div className="mb-6">
              <h3 className="mb-3 font-medium text-gray-900">Programming Language</h3>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <label key={lang} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="language"
                      checked={selectedLanguage === lang}
                      onChange={() => setSelectedLanguage(lang)}
                    />
                    <span className="text-sm text-gray-900">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <h3 className="mb-3 font-medium text-gray-900">Difficulty</h3>
              <div className="space-y-2">
                {difficulties.map((diff) => (
                  <label key={diff} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      checked={selectedDifficulty === diff}
                      onChange={() => setSelectedDifficulty(diff)}
                    />
                    <span className="text-sm text-gray-900">{diff}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="mb-8">
              <h3 className="mb-3 font-medium text-gray-900">Topics</h3>
              <div className="space-y-2">
                {topics.map((topic) => (
                  <label key={topic} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="topic"
                      checked={selectedTopic === topic}
                      onChange={() => setSelectedTopic(topic)}
                    />
                    <span className="text-sm text-gray-900">{topic}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Find Match Button */}
            <button
              onClick={handleFindMatch}
              disabled={isLoading}
              className={`w-full rounded-full px-6 py-3 font-medium text-gray-900 transition-colors
                        ${isLoading || isFindMatchDisabled ? "bg-blue-200 cursor-not-allowed" : "bg-blue-300 hover:bg-blue-400"}`}
            >
              {isLoading ? "FINDING..." : "FIND MATCH"}
            </button>

            {isFindMatchDisabled && (
              <p className="text-center text-xs text-red-500">
                Please select one option from each category.
              </p>
            )}

          </div>

          {/* Matching Results */}
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">Matching Results</h2>
            {isLoading ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <p className="text-gray-600">Finding matches...</p>
              </div>
            ) : matchResults.length > 0 ? (
              <div className="space-y-4">
                {matchResults.map((match) => (
                  <div key={match.id} className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-900 bg-blue-200">
                        <User className="h-7 w-7 text-gray-900" />
                      </div>
                      <span className="text-xl font-medium text-gray-900">{match.name}</span>
                    </div>
                    <button
                      onClick={() => handleMatchNow(match.id)}
                      className="rounded-full bg-blue-300 px-6 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-400"
                    >
                      MATCH NOW
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <p className="text-gray-600">No matches found. Select criteria and click "FIND MATCH" to search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
