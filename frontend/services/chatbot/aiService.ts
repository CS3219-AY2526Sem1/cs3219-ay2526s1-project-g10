import axios from "axios";

export async function sendAIChat(question: string, code: string, message: string) {
  const res = await axios.post(`${process.env.NEXT_PUBLIC_COLLAB_URL}/ai/chat`, {
    question,
    code,
    message
  });
  return res.data;
}
