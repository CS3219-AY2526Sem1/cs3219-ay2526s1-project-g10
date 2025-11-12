// Question service - switches between mock and real based on environment
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

import * as mockQuestion from "./mockQuestion"
import * as realQuestion from "./realQuestion"

export type {
	Question,
	QuestionListResponse,
	QuestionPayload,
	QuestionUpdatePayload,
} from "./realQuestion"

const questionService = USE_MOCK ? mockQuestion : realQuestion

export const { getQuestions, createQuestion, updateQuestion, deleteQuestion } = questionService
