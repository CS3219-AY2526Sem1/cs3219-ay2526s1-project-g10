import axios from "axios";
import { getRuntimeEnv, stripTrailingSlash } from "../../lib/runtimeEnv";

const LOCAL_COLLAB_HTTP = "http://localhost:3004";
const PROD_COLLAB_HTTP = "https://collab-service-j4i3ud5cyq-as.a.run.app";

const resolveCollabHttpBase = (): string => {
  const fallback = process.env.NODE_ENV === "production" ? PROD_COLLAB_HTTP : LOCAL_COLLAB_HTTP;
  const explicit = getRuntimeEnv("NEXT_PUBLIC_COLLAB_URL", fallback);
  return stripTrailingSlash(explicit ?? fallback);
};

export async function sendAIChat(question: string, code: string, message: string) {
  const collabHttpBase = resolveCollabHttpBase();
  const res = await axios.post(`${collabHttpBase}/ai/chat`, {
    question,
    code,
    message,
  });
  return res.data;
}
