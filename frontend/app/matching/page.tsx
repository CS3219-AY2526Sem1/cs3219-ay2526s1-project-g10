"use client"

import { useEffect, useRef, useState } from "react"
import { cancelMatching, findMatches, matchWithUser, type MatchResult, type MatchCriteria } from "../../services/matching"
import { useRouter, useSearchParams } from "next/navigation"
import { AppHeader } from "../../components/navigation/AppHeader"
import { User, Users } from "lucide-react"

export default function MatchPage() {
  //const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchMessage, setSearchMessage] = useState<string>("")
  const [notice, setNotice] = useState<string | null>(null)
  const roomPollActiveRef = useRef(false)
  const hasActiveSessionRef = useRef(false)
  const noticeHandledRef = useRef(false)
  const searchParams = useSearchParams()

  // const isFindMatchDisabled = !selectedLanguage || !selectedDifficulty || !selectedTopic
  const isFindMatchDisabled = !selectedDifficulty || !selectedTopic
  const router = useRouter()

  //const languages = ["Java", "Python", "C"]
  const difficulties = ["Easy", "Medium", "Hard"]
  const topics = [
    "Shell",
    "Queue",
    "Dynamic Programming",
    "Algorithms",
    "Linked List",
    "Hash Table",
    "Math",
    "Others",
    "String",
    "Database",
    "Array",
    "Tree",
    "Graph",
    "Concurrency",
    "Stack",
  ]

  useEffect(() => {
    return () => {
      roomPollActiveRef.current = false
      if (!hasActiveSessionRef.current) {
        void cancelMatching()
      }
    }
  }, [])

//   useEffect(() => {
//     const noticeParam = searchParams.get("notice")
//     if (noticeParam === "session-ended") {
//       if (noticeHandledRef.current) {
//         return
//       }
//       noticeHandledRef.current = true
//       const message = "The collaboration room was closed."
//       setNotice(message)
//       setSearchMessage(message)
//       router.replace("/matching")
//     } else {
//       noticeHandledRef.current = false
//     }
//   }, [searchParams, router])

  useEffect(() => {
    const noticeParam = searchParams.get("notice")

    if (noticeParam === "session-ended") {
      if (noticeHandledRef.current) {
        return
      }
      noticeHandledRef.current = true
      const message = "The collaboration room was closed."
      setNotice(message)
      setSearchMessage(message)
      router.replace("/matching")
    } else if (noticeParam === "left-custom-room") {
      if (noticeHandledRef.current) {
        return
      }
      noticeHandledRef.current = true
      const message = "You have left the custom room."
      setNotice(message)
      setSearchMessage(message)
      router.replace("/matching")
    } else {
      noticeHandledRef.current = false
    }
  }, [searchParams, router])

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

    setNotice(null)
    setIsLoading(true)
    setSearchMessage("Searching for match...")
    setMatchResults([])
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
      setNotice(null)
      const roomId = await matchWithUser(userId)
      hasActiveSessionRef.current = true
      router.push(`/collaboration?roomId=${encodeURIComponent(roomId)}`)
    } catch (error) { 
      console.error("Error matching with user:", error)
      const message = error instanceof Error ? error.message : "Failed to confirm match. Please try again."
      setSearchMessage(message)
    }
  }

  const handleCustomRoom = () => {
    router.push("/custom-matching")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <AppHeader />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {notice && (
          <div className="mb-6 rounded-xl border border-blue-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 px-4 py-3 text-sm text-blue-900 dark:text-gray-100 transition-colors">
            {notice}
          </div>
        )}
        <div className="mb-6">
          <button
            onClick={handleCustomRoom}
            className="flex items-center gap-2 rounded-full bg-blue-500 dark:bg-gray-700 px-6 py-3 font-medium text-white dark:text-gray-100 transition-colors hover:bg-blue-600 dark:hover:bg-gray-600"
          >
            <Users className="h-5 w-5" />
            Create/Join Custom Room
          </button>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          {/* Matching Criteria Sidebar */}
          <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">Matching Criteria</h2>

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
              <h3 className="mb-3 font-medium text-gray-900 dark:text-gray-200">Difficulty</h3>
              <div className="space-y-2">
                {difficulties.map((diff) => (
                  <label key={diff} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      checked={selectedDifficulty === diff}
                      onChange={() => setSelectedDifficulty(diff)}
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-200">{diff}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="mb-8">
              <h3 className="mb-3 font-medium text-gray-900 dark:text-gray-200">Topics</h3>
              <div className="space-y-2">
                {topics.map((topic) => (
                  <label key={topic} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="topic"
                      checked={selectedTopic === topic}
                      onChange={() => setSelectedTopic(topic)}
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-200">{topic}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Find Match Button */}
            <button
              onClick={handleFindMatch}
              disabled={isLoading || isFindMatchDisabled}
              className={`w-full rounded-full px-6 py-3 font-medium text-gray-900 dark:text-gray-100 transition-colors
                        ${isLoading || isFindMatchDisabled ? "bg-blue-200 dark:bg-gray-600 cursor-not-allowed" : "bg-blue-300 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-gray-600"}`}
            >
              {isLoading ? "FINDING..." : "FIND MATCH"}
            </button>

            {isFindMatchDisabled && (
              <p className="text-center text-xs text-red-500 dark:text-red-400">
                Please select one option from each category.
              </p>
            )}

          </div>

          {/* Matching Results */}
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Matching Results</h2>
            {isLoading ? (
              <div className="rounded-2xl bg-white dark:bg-gray-800 p-12 text-center shadow-sm transition-colors">
                <p className="text-gray-600 dark:text-gray-300">{searchMessage}</p>
              </div>
            ) : matchResults.length > 0 ? (
              <div className="space-y-4">
                {matchResults.map((match) => (
                  <div key={match.id} className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-900 bg-blue-200">
                        <User className="h-7 w-7 text-gray-900 dark:text-gray-100" />
                      </div>
                      <span className="text-xl font-medium text-gray-900 dark:text-gray-100">{match.name}</span>
                    </div>
                    <button
                      onClick={() => handleMatchNow(match.id)}
                      className="rounded-full bg-blue-300 dark:bg-gray-700 px-6 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-blue-400 dark:hover:bg-gray-600"
                    >
                      MATCH NOW
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                {searchMessage || "No matches found. Select criteria and click 'FIND MATCH' to search."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
