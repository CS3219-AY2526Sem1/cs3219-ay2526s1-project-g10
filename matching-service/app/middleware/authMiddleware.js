import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = {
      userId: data.user.id,
      email: data.user.email,
      emailConfirmedAt: data.user.email_confirmed_at,
      difficulty: req.body?.difficulty || req.query?.difficulty || null,
      topic: req.body?.topic || req.query?.topic || null,
    };

    next();
  } catch (err) {
    console.error("Auth verification failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
