"use client"

import { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import { getUserAttempts, type Attempt } from "../../services/history"
import { useAuth } from "../../contexts/auth-context"
import { AppHeader } from "../../components/navigation/AppHeader"
import {getQuestion} from "../../services/question";
import AttemptDetailsDialog from "./components/attemptDetailsDialog";

export default function AttemptHistoryPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const data = await getUserAttempts(user.id)

        //fetch question details for each attempt
        const questionDetails = await Promise.all(
          data.map(async (attempt) => {
            const question = await getQuestion(attempt.questionId)
            return {
              ...attempt,
              questionTitle: question ? question.title : "Unknown Question",
                difficulty: question ? question.difficulty : "Easy",
            }
          }),
        )
        console.log("attempts", attempts)
        setAttempts(questionDetails)

      } catch (error) {
        console.error("Error fetching attempts:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const filteredAttempts = attempts.filter((attempt) =>
    attempt.questionTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  // transforms ISO dateTime string to readable format
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }); // e.g., Jan, Feb
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format

    const formattedDate = `${day.toString().padStart(2, '0')}/${month
      .toString()
      .padStart(2, '0')}/${year} ${formattedHours
      .toString()
      .padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${amPm}`;

    return formattedDate;
  };

  const getStatusColor = (status: string) => {
    return status === "COMPLETED" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
  }

  const openAttemptDialog = async (attempt: Attempt) => {
    if (!attempt.questionJson) return;
    setSelectedQuestion(attempt.questionJson);
    setSelectedAttempt(attempt)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Attempt History</h1>

        {/* Attempts Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Question</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Difficulty</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                {/*<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Duration</th>*/}
                {/*<th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Score</th>*/}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading attempts...
                  </td>
                </tr>
              ) : filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No attempts found
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{attempt.questionTitle}</td>
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
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(attempt.attemptedAt)}</td>
                    {/*<td className="px-6 py-4 text-sm text-gray-600">{attempt.duration}</td>*/}
                    {/*<td className="px-6 py-4 text-sm text-gray-600">{attempt.score}%</td>*/}
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              onClick={() => openAttemptDialog(attempt)}
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAttempt && selectedQuestion &&(
          <AttemptDetailsDialog attempt={selectedAttempt} onClose={() => setSelectedAttempt(null)} question={selectedQuestion} />
      )}
    </div>
  )
}
