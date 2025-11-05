"use client"

import { useEffect, useRef, useState } from "react"
import { cancelMatching, findMatches, matchWithUser, type MatchResult, type MatchCriteria } from "../../services/matching"
import { useRouter } from "next/navigation"
import { AppHeader } from "../../components/navigation/AppHeader"
import { User } from "lucide-react"

export default function MatchPage() {
  //const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchMessage, setSearchMessage] = useState<string>("")
  const roomPollActiveRef = useRef(false)
  const hasActiveSessionRef = useRef(false)

  // const isFindMatchDisabled = !selectedLanguage || !selectedDifficulty || !selectedTopic
  const isFindMatchDisabled = !selectedDifficulty || !selectedTopic
  const router = useRouter()

  //const languages = ["Java", "Python", "C"]
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

  useEffect(() => {
    return () => {
      roomPollActiveRef.current = false
      if (!hasActiveSessionRef.current) {
        void cancelMatching()
      }
    }
  }, [])

  const stopRoomPolling = () => {
    roomPollActiveRef.current = false
  }

  const startRoomPolling = (criteria: MatchCriteria, partnerName: string) => {
    if (!criteria.difficulties || !criteria.topics) {
      return
    }
    if (roomPollActiveRef.current) {
      return
    }

    roomPollActiveRef.current = true
    setSearchMessage(`Match found! Waiting for ${partnerName} to confirm...`)

    const poll = async () => {
      try {
        while (roomPollActiveRef.current) {
          const outcome = await findMatches(criteria)

          if (!roomPollActiveRef.current) {
            break
          }

          if (outcome.roomId) {
            roomPollActiveRef.current = false
            const roomPartnerName = partnerName || outcome.matches[0]?.name || "your partner"
            setSearchMessage(`Matched with ${roomPartnerName}! Redirecting...`)
            hasActiveSessionRef.current = true
            router.push(`/collaboration?roomId=${encodeURIComponent(outcome.roomId)}`)
            return
          }

          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      } catch (error) {
        if (roomPollActiveRef.current) {
          console.error("Error while polling for collaboration room:", error)
          setSearchMessage("Error while waiting for collaboration room. Please try again.")
        }
      } finally {
        roomPollActiveRef.current = false
      }
    }

    poll().catch((err) => {
      console.error("Unexpected error in room polling:", err)
    })
  }

  const handleFindMatch = async () => {
      if (isFindMatchDisabled) {
        setSearchMessage("Please select a difficulty and topic before searching.")
        return
      }

      setIsLoading(true)
      setSearchMessage("Searching for match...")
      setMatchResults([]) // Clear previous results
      stopRoomPolling()
  hasActiveSessionRef.current = false

      try {
        await cancelMatching()
      } catch (error) {
        console.warn("Unable to cancel previous matching session:", error)
      }

      try {
        const criteria: MatchCriteria = {
          difficulties: selectedDifficulty,
          topics: selectedTopic,
        }
        const outcome = await findMatches(criteria, (msg) => {
          setSearchMessage(msg)
        })

        setMatchResults(outcome.matches)

        if (outcome.roomId && outcome.matches.length > 0) {
          const partnerName = outcome.matches[0]?.name ?? "your partner"
          setSearchMessage(`Matched with ${partnerName}! Redirecting...`)
          hasActiveSessionRef.current = true
          router.push(`/collaboration?roomId=${encodeURIComponent(outcome.roomId)}`)
          return
        }

        if (outcome.matches.length > 0) {
          const partnerName = outcome.matches[0]?.name ?? "your partner"
          setSearchMessage("Match found! Confirm to collaborate.")
          startRoomPolling(criteria, partnerName)
        } else {
          setSearchMessage("No match found. Try different criteria.")
        }
      } catch (error) {
        console.error("Error fetching matches:", error)
        const message = error instanceof Error ? error.message : "Error occurred. Please try again."
        setSearchMessage(message)
      } finally {
        setIsLoading(false)
      }
    }

  const handleMatchNow = async (userId: string) => {
    try {
      stopRoomPolling()
      const roomId = await matchWithUser(userId)
      hasActiveSessionRef.current = true
      router.push(`/collaboration?roomId=${encodeURIComponent(roomId)}`)
    } catch (error) { 
      console.error("Error matching with user:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          {/* Matching Criteria Sidebar */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Matching Criteria</h2>

            {/* Programming Language */}
            {/* <div className="mb-6">
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
            </div> */}

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
              disabled={isLoading || isFindMatchDisabled}
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
                <p className="text-gray-600">{searchMessage}</p>
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
              <p className="text-gray-600">
                {searchMessage || "No matches found. Select criteria and click 'FIND MATCH' to search."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
