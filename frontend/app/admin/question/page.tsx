"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, Edit, Trash2, Plus, X, ArrowLeft } from "lucide-react"
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion as deleteQuestionService,
  type Question,
  type QuestionPayload,
} from "../../../services/question"

type QuestionFormState = {
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  topic: string
  solution: string
  descriptionImages: string
  constraints: string
  examples: string
  language: string
  followUp: string
}

const INITIAL_FORM: QuestionFormState = {
  title: "",
  description: "",
  difficulty: "Easy",
  topic: "",
  solution: "",
  descriptionImages: "",
  constraints: "",
  examples: "",
  language: "",
  followUp: "",
}

const PAGE_SIZE = 10

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formState, setFormState] = useState<QuestionFormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getQuestions({ page, limit: PAGE_SIZE, search: searchQuery || undefined })
      setQuestions(response.questions)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
    } catch (error) {
      console.error("Error fetching questions:", error)
      alert("Failed to load questions. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const handleDelete = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return
    }

    try {
      await deleteQuestionService(questionId)
      await loadQuestions()
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("Failed to delete question")
    }
  }

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

  const splitToArray = (value: string) =>
    value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

  const resetForm = () => {
    setFormState(INITIAL_FORM)
    setFormError(null)
    setEditingQuestion(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (question: Question) => {
    setEditingQuestion(question)
    setFormState({
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      topic: question.topic,
      solution: question.solution,
      descriptionImages: (question.descriptionImages ?? []).join("\n"),
      constraints: (question.constraints ?? []).join("\n"),
      examples: question.examples ? JSON.stringify(question.examples, null, 2) : "",
      language: question.language ?? "",
      followUp: question.followUp ?? "",
    })
    setFormError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    if (submitting) return
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async () => {
    setFormError(null)

    if (!formState.title.trim() || !formState.description.trim() || !formState.solution.trim() || !formState.topic.trim()) {
      setFormError("Please fill in all required fields")
      return
    }

    let parsedExamples: any = null
    if (formState.examples.trim().length > 0) {
      try {
        parsedExamples = JSON.parse(formState.examples)
      } catch (error) {
        setFormError("Examples must be valid JSON")
        return
      }
    }

    const payload: QuestionPayload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      solution: formState.solution.trim(),
      difficulty: formState.difficulty,
      topic: formState.topic.trim(),
      descriptionImages: splitToArray(formState.descriptionImages),
      constraints: splitToArray(formState.constraints),
      examples: parsedExamples,
      language: formState.language.trim() || null,
      followUp: formState.followUp.trim() || null,
    }

    setSubmitting(true)

    try {
      if (editingQuestion) {
        const updated = await updateQuestion(editingQuestion.id, payload)
        setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
      } else {
        await createQuestion(payload)
        setPage(1)
        setLoading(true)
        try {
          const refreshed = await getQuestions({ page: 1, limit: PAGE_SIZE, search: searchQuery || undefined })
          setQuestions(refreshed.questions)
          setTotalPages(refreshed.totalPages)
          setTotalCount(refreshed.totalCount)
        } catch (refreshError) {
          console.error("Error refreshing question list:", refreshError)
          alert("Question created but failed to refresh the list. Please reload the page.")
        } finally {
          setLoading(false)
        }
      }

      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error("Error saving question:", error)
      const message = error instanceof Error ? error.message : "Failed to save question"
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const topicsForDisplay = (question: Question) =>
    question.topic
      .split(/\s*,\s*/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
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
            <span className="text-2xl font-bold text-gray-900">Question Management</span>
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
            <p className="text-sm text-gray-600">{totalCount} questions in database</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-400 hover:bg-blue-500 text-gray-900 font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions by title, topic, or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-400 bg-white"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Difficulty</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Topics</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Loading questions...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No questions found
                  </td>
                </tr>
              ) : (
                questions.map((question) => {
                  const topics = topicsForDisplay(question)
                  return (
                    <tr key={question.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{question.title}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                        >
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {topics.length > 0 ? (
                            topics.map((topic, idx) => (
                              <span
                                key={`${topic}-${idx}`}
                                className="inline-flex px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                              >
                                {topic}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(question)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={`Edit ${question.title}`}
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(question.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Delete ${question.title}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editingQuestion ? "Edit question" : "Add new question"}
                </h2>
                <p className="text-sm text-gray-500">
                  Fill in the details below to {editingQuestion ? "update" : "create"} a question.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</div>}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter question title"
                  disabled={submitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  value={formState.description}
                  onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Describe the problem statement"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty *</label>
                <select
                  value={formState.difficulty}
                  onChange={(e) => setFormState((prev) => ({ ...prev, difficulty: e.target.value as QuestionFormState["difficulty"] }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  disabled={submitting}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Topic *</label>
                <input
                  type="text"
                  value={formState.topic}
                  onChange={(e) => setFormState((prev) => ({ ...prev, topic: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="E.g. Array, Dynamic Programming"
                  disabled={submitting}
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple topics with commas.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Solution *</label>
                <textarea
                  value={formState.solution}
                  onChange={(e) => setFormState((prev) => ({ ...prev, solution: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Provide the reference solution or explanation"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <input
                  type="text"
                  value={formState.language}
                  onChange={(e) => setFormState((prev) => ({ ...prev, language: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Optional programming language"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Follow-up</label>
                <input
                  type="text"
                  value={formState.followUp}
                  onChange={(e) => setFormState((prev) => ({ ...prev, followUp: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Optional follow-up prompt"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description images</label>
                <textarea
                  value={formState.descriptionImages}
                  onChange={(e) => setFormState((prev) => ({ ...prev, descriptionImages: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter one image URL per line"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Constraints</label>
                <textarea
                  value={formState.constraints}
                  onChange={(e) => setFormState((prev) => ({ ...prev, constraints: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter one constraint per line"
                  disabled={submitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Examples (JSON)</label>
                <textarea
                  value={formState.examples}
                  onChange={(e) => setFormState((prev) => ({ ...prev, examples: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
                  placeholder='[{"input": "...", "output": "..."}]'
                  disabled={submitting}
                />
                <p className="mt-1 text-xs text-gray-500">Provide a valid JSON array or object describing sample inputs and outputs.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={closeModal}
                className="rounded-full px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingQuestion ? "Save changes" : "Create question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
