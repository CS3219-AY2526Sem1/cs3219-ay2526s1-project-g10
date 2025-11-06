"use client"

import type { MatchQuestion, MatchQuestionExample } from "../../../services/matching"

type Props = {
  question: MatchQuestion | null
  loading: boolean
  error?: string | null
}

const toExampleText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ""
  }
  if (typeof value === "string") {
    return value
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const normalizeExamples = (examples: MatchQuestion["examples"]): MatchQuestionExample[] => {
  if (!examples) return []
  if (!Array.isArray(examples)) return []

  return examples
    .map((example) => ({
      input: toExampleText(example?.input),
      output: toExampleText(example?.output),
      explanation: example?.explanation ? toExampleText(example?.explanation) : undefined,
    }))
    .filter((example) => example.input || example.output || example.explanation)
}

export default function ProblemDescriptionPanel({ question, loading, error }: Props) {
  const normalizedExamples = normalizeExamples(question?.examples ?? null)
  const constraints = Array.isArray(question?.constraints) ? question?.constraints : []
  const descriptionImages = Array.isArray(question?.descriptionImages) ? question.descriptionImages : []

  return (
    <div className="w-1/2 bg-slate-800 p-8 border-r overflow-auto text-white">
      {loading ? (
        <div className="text-lg font-medium text-blue-200">Loading question...</div>
      ) : error ? (
        <div className="text-red-300">
          <p className="text-lg font-semibold">Unable to load question</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      ) : !question ? (
        <div className="text-blue-200">Waiting for a question assignment...</div>
      ) : (
        <>
          <div className="mb-4">
            <h1 className="text-3xl font-extrabold mb-2 drop-shadow">{question.title}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-blue-200">
              {question.difficulty && (
                <span className="rounded-full bg-slate-700 px-3 py-1 uppercase tracking-wide">
                  {question.difficulty}
                </span>
              )}
              {question.topic && (
                <span className="rounded-full bg-slate-700 px-3 py-1">
                  {question.topic}
                </span>
              )}
            </div>
          </div>

          <p className="mb-6 text-lg whitespace-pre-wrap">{question.description}</p>

          {descriptionImages.length > 0 && (
            <div className="mb-6 space-y-4">
              {descriptionImages.map((src, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden border border-slate-700/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Problem illustration ${idx + 1}`} className="w-full object-contain bg-slate-900" />
                </div>
              ))}
            </div>
          )}

          {constraints.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-blue-300">Constraints</h2>
              <ul className="space-y-2">
                {constraints.map((constraint, idx) => (
                  <li key={idx} className="bg-slate-700/60 px-4 py-2 rounded">
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-2 text-blue-300">Examples</h2>
          {normalizedExamples.length === 0 ? (
            <p className="text-sm text-slate-300">No examples provided for this question.</p>
          ) : (
            <ul className="space-y-4">
              {normalizedExamples.map((example, idx) => (
                <li key={idx} className="bg-slate-700 p-4 rounded shadow text-white">
                  {example.input && (
                    <div className="mb-1">
                      <strong className="text-blue-200">Input:</strong> {example.input}
                    </div>
                  )}
                  {example.output && (
                    <div className="mb-1">
                      <strong className="text-blue-200">Output:</strong> {example.output}
                    </div>
                  )}
                  {example.explanation && (
                    <div>
                      <strong className="text-blue-200">Explanation:</strong> {example.explanation}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {question.followUp && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2 text-blue-300">Follow-up</h2>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{question.followUp}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}