// Question service - switches between mock and real based on environment
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

import * as mockQuestion from "./mockQuestion"
import * as realQuestion from "./realQuestion"

// Re-export shared types from real service definition
export type { Question } from "./realQuestion"

const svc = USE_MOCK ? mockQuestion : realQuestion

// Export stable function names so Next.js can statically analyze exports
export const getQuestions = (...args: any[]) => (svc as any).getQuestions(...args)
export const getQuestion = (...args: any[]) => (svc as any).getQuestion(...args)
export const createQuestion = (...args: any[]) => (svc as any).createQuestion(...args)
export const updateQuestion = (...args: any[]) => (svc as any).updateQuestion(...args)
export const deleteQuestion = (...args: any[]) => (svc as any).deleteQuestion(...args)
