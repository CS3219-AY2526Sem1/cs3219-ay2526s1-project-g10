// import "dotenv/config";

// const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL;

const QUESTION_SERVICE_URL =
  typeof window === "undefined"
    ? process.env.QUESTION_SERVICE_URL // backend (matching-service)
    : process.env.NEXT_PUBLIC_API_GATEWAY_URL; // frontend (browser)

    
export async function fetchRandomQuestion({ difficulty, topic }) {
  const searchParams = new URLSearchParams();

  if (difficulty) {
    searchParams.set("difficulty", difficulty.toUpperCase());
  }

  if (topic) {
    searchParams.set("topic", topic);
  }

  const endpoint = `${QUESTION_SERVICE_URL}/questions${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  try {
    const response = await fetch(endpoint);

    if (response.status === 404) {
      // No question found for this topic + difficulty
      return null;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Question service error ${response.status}: ${body}`);
    }

    const payload = await response.json();
    return payload;
  } catch (error) {
    console.error("Failed to fetch question from question service:", error);
    throw error;
  }
}
