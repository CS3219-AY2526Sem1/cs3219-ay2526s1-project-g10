import type {
  Question,
  QuestionListResponse,
  QuestionPayload,
  QuestionUpdatePayload,
} from "./realQuestion"

export type { Question, QuestionListResponse, QuestionPayload, QuestionUpdatePayload }

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers, return indices of the two numbers that add up to a specific target.",
    descriptionImages: [],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
      },
    ],
    solution: "Use a hash map to track complements.",
    difficulty: "Easy",
    language: "javascript",
    topic: "Array,Hash Table",
    followUp: "What if the input array is sorted?",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Reverse Linked List",
    description: "Reverse a singly linked list.",
    descriptionImages: [],
    constraints: ["The number of nodes in the list is in the range [0, 5000]."],
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
      },
    ],
    solution: "Iterate through the list and reverse pointers.",
    difficulty: "Medium",
    language: "typescript",
    topic: "Linked List",
    followUp: null,
    createdAt: new Date().toISOString(),
  },
];

function filterQuestions({ search, difficulty }: { search?: string; difficulty?: string }) {
  let filtered = [...MOCK_QUESTIONS];

  if (difficulty && difficulty.toLowerCase() !== "all") {
    filtered = filtered.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (q) =>
        q.title.toLowerCase().includes(searchLower) ||
        q.description.toLowerCase().includes(searchLower) ||
        q.topic.toLowerCase().includes(searchLower),
    );
  }

  return filtered;
}

export async function getQuestions(params?: {
  page?: number
  limit?: number
  search?: string
  difficulty?: string
  topic?: string
}): Promise<QuestionListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const { page = 1, limit = 20, search, difficulty, topic } = params ?? {};
  let filtered = filterQuestions({ search, difficulty });

  if (topic) {
    const topicLower = topic.toLowerCase();
    filtered = filtered.filter((q) => q.topic.toLowerCase().includes(topicLower));
  }

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    questions: filtered.slice(start, end),
    totalCount,
    totalPages,
    currentPage: page,
  };
}

export async function createQuestion(question: QuestionPayload): Promise<Question> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const newQuestion: Question = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    title: question.title,
    description: question.description,
    descriptionImages: question.descriptionImages ?? [],
    constraints: question.constraints ?? [],
    examples: question.examples ?? null,
    solution: question.solution,
    difficulty: question.difficulty,
    language: question.language ?? null,
    topic: question.topic,
    followUp: question.followUp ?? null,
  };
  MOCK_QUESTIONS.unshift(newQuestion);
  return newQuestion;
}

export async function updateQuestion(id: number, updates: QuestionUpdatePayload): Promise<Question> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const index = MOCK_QUESTIONS.findIndex((q) => q.id === id);
  if (index === -1) {
    throw new Error("Question not found");
  }

  const updated: Question = {
    ...MOCK_QUESTIONS[index],
    ...updates,
    id,
  };
  MOCK_QUESTIONS[index] = updated;
  return updated;
}

export async function deleteQuestion(id: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const index = MOCK_QUESTIONS.findIndex((q) => q.id === id);
  if (index !== -1) {
    MOCK_QUESTIONS.splice(index, 1);
  }
}
