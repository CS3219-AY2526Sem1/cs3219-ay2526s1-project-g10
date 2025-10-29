// Question service - switches between mock and real based on environment
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export type { Question } from "./mockQuestion"

export const questionService = USE_MOCK ? require("./mockQuestion") : require("./realQuestion")

export const { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion } = questionService
